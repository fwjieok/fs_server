'use strict';
/*jslint vars : true*/
var formidable = require('formidable');
var uuid       = require('small-uuid');
var crypto     = require('crypto');
var util       = require('util');
var mkdirp     = require('mkdirp');
var request    = require('request');
var fs         = require('fs');
var FSC        = process.env.FSC;
FSC="http://47.106.171.52:7000";

var fs_root    = process.env.HOME + "/.fs";

function Uploader(req, res) {
    this.req	= req;
    this.res	= res;
    this.form	= new formidable.IncomingForm();
    this.buf	= [];
    this.files	= [];

    this.setup_form();
    
    this.form.parse(this.req, this.on_finished.bind(this));
}

Uploader.prototype.setup_form = function () {
    this.form.on('fileBegin', function (name, file) {
        this.file = file;
        file.hash = crypto.createHash('md5');
        file.fid  = uuid.create();
        file.path = fs_root + "/inbox/" + file.fid;
    }.bind(this));
    
    this.form.on('aborted', this.done.bind(this));
    this.form.on('error',   this.done.bind(this));
    this.form.on('end',     this.done.bind(this));
    this.form.on('file',    this.on_file.bind(this));

    this.form.on('progress', function (bytesReceived, bytesExpected) {
        // console.log(bytesReceived, bytesExpected);
    }.bind(this));
};

Uploader.prototype.on_file = function (name, file) {
    if (file.size === 0) {
        return fs.unlink(file.path);
    }
    this.files.push(file);
    var url = FSC + "/api/new?fid=%s&fname=%s&hash=%s&size=%d&type=%s";
    url = util.format(url,
		      encodeURIComponent(file.fid),
		      encodeURIComponent(file.name),
		      file.hash, file.size, file.type);
    console.log(url);
    file.uploader = this;
    file.deleted  = false;
    
    var option = {
        url : url,
        headers: {
            'tid': process.env.FS_TID
        }
    };

    if (this.req.app.server.protocol == "https") {
        option.cert = this.tls.cert;
        option.key  = this.tls.key;
        option.ca   = this.tls.ca;
    }
    
    request(option, function (error, res, result) {
        if (error) {
	    console.error("-------------- request fsc/new error -------------");
            console.error(error);
            fs.unlink(this.path);
            this.deleted  = true;
            this.finished = true;
	    return this.uploader.done(error);
        }

	if (res.statusCode !== 200) {
	    console.error("-------------- request fsc/new fail code: ", res.statusCode);
	    return this.uploader.done(this.name + ":", res.statusCode);
        }

	if (res.statusCode === 200) {
            result = JSON.parse(result);
	    console.error("-------------- request fsc/new success -------------");
            if (result.exists) {
                this.fid = result.fid;
                fs.unlink(this.path);
                this.deleted  = true;
                this.finished = true;
                return this.uploader.done();
            }
	    
            var dest = fs_root + "/root";
            dest = dest + "/" + this.hash.substr(-3, 3);
            dest = dest + "/" + this.hash.substr(-6, 3);
            mkdirp.sync(dest);
            dest = dest + "/" + this.hash;
            // 不用rename方法,为了兼容 当挂载windows的共享盘时 出现跨盘符错误，改用流方式
            var readStream  = fs.createReadStream(this.path);
            var writeStream = fs.createWriteStream(dest);
            readStream.pipe(writeStream);

	    writeStream.on('finish', function () {
                fs.unlink(this.path);
                this.deleted  = true;
                this.finished = true;
                this.uploader.done();
            }.bind(this));
	    
            readStream.on('error', function (err) {
                this.finished = true;
                this.uploader.done(err);
                writeStream.end();
            }.bind(this));
        }
    }.bind(file));
};

Uploader.prototype.on_finished = function (err, fields, files) {
    this.finished = true;
    this.done(err);
};

Uploader.prototype.done = function (err) {
    if (err) {
        console.error(err);
        if (!this.isResponse) {
            this.res.status(500).end(err.message);
            this.isResponse = true;
        }
        return;
    }
    
    if (!this.finished) {
        return;
    }
    
    var finished = true;
    var fids     = [];
    for (var i = 0; i < this.files.length; i++) {
        var file = this.files[i];
        if (!file.finished) {
            finished = false;
            break;
        }
	
        fids.push({
            fid  : file.fid,
            name : file.name,
            size : file.size,
            hash : file.hash
        });
    }
    
    if (!finished) {
        return;
    }

    console.log("--------------- done -----------------");
    console.log(JSON.stringify(fids, null, 4));
    if (!this.isResponse) {
        this.res.json(fids);
        this.isResponse = true;
    } else {
        // 最终只要有一次失败,做最后清理操作
        for (var i = 0; i < this.files.length; i++) {
            var file = this.files[i];
            if (!file.deleted) {
                try {
                    fs.unlink(file.path);
                } catch (error) {
                    console.error(error);
                }
            }
        }
    }
};

module.exports = function (req, res) {
    var uploader = new Uploader(req, res);
};
