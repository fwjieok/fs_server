'use strict';
/*jslint vars : true*/
var formidable = require('formidable');
var uuid = require('small-uuid');
var crypto = require('crypto');
var util = require('util');
var path = require('path');
var mkdirp = require('mkdirp');
var request = require('request');
var fs = require('fs');
var FSC = process.env.FSC;
FSC = "http://47.106.171.52:7000";

var fs_root = process.env.HOME + "/.fs";

var crypto_md5 = crypto.createHash('md5');

function Uploader(req, res) {
    this.req   = req;
    this.res   = res;
    this.files = [];

    this.req_finished = false;      //标识请求是否完成
    this.res_finished = false;      //标识响应是否完成

    this.form = new formidable.IncomingForm();
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
    this.form.on('file',    this.on_file.bind(this));
    this.form.on('end',     this.on_finished.bind(this));

    this.form.on('progress', function (bytesReceived, bytesExpected) {

    }.bind(this));
};

Uploader.prototype.on_finished = function (err, fields, files) {
    this.req_finished  = true;      //request end
    this.done();
};

Uploader.prototype.request_fsc_new = function (file, callback) {
    var url = FSC + "/core/new?fid=%s&fname=%s&hash=%s&size=%d&type=%s";
    url = util.format(url,
        encodeURIComponent(file.fid),
        encodeURIComponent(file.name),
        file.hash, file.size, file.type);

    console.log(url);

    var option = {
        url: url,
        headers: {
            'tid': process.env.FS_TID
        }
    };

    if (this.req.app.server.protocol == "https") {
        option.cert = this.tls.cert;
        option.key  = this.tls.key;
        option.ca   = this.tls.ca;
    }

    request(option, callback);
};

Uploader.prototype.on_file = function (name, file) {
    file.finished = false;      //文件是否处理完毕(req_fsc_new, rename等是异步操作)
    file.uploader = this;
    this.files.push(file);      //多文件上传

    if (file.size === 0) {
        fs.unlink(file.path);
        file.finished = true;
        file.error    = "file size is 0";        
        return this.done();
    }
    
    this.request_fsc_new(file, function (error, res, result) {
        if (error) {
            fs.unlink(this.path);  //最后统一清理
            file.finished = true;
            file.error    = error;
            if (typeof error !== "string") {
                file.error   = JSON.stringify(error);
            }            
            return this.uploader.done();
        }

        if (res.statusCode !== 200) {
            fs.unlink(this.path);
            file.finished = true;          
            var error = {
                code: res.statusCode,
                result: result
            }
            file.error = JSON.stringify(error);
            return this.uploader.done();
        }

        if (res.statusCode === 200) {
            result = JSON.parse(result);
            if (result.exists) {
                fs.unlink(this.path);
                file.exist    = true;
                file.finished = true;
                file.error    = "file already exists";
                console.error("-------------- file exist -------------");
                return this.uploader.done();
            }

            console.error("-------------- request fsc/new success -------------");

            var dest_dir  = path.join(fs_root, "/root", file.hash.substr(-3, 3), file.hash.substr(-6, 3));
            mkdirp.sync(dest_dir);
            var dest_path = path.join(dest_dir, file.hash);

            fs.rename(this.path, dest_path, function (error) {
                if (error) {  
                    fs.unlink(this.path);                      
                    if (typeof error !== "string") {
                        file.error   = JSON.stringify(error);
                    }  
                    this.error = error;        
                }
                this.finished = true;
                this.uploader.done();
            }.bind(this));
         
        }
    }.bind(file));
};

Uploader.prototype.done = function (err) {
    if (err) {                      //request error or abort
        console.error(err);
        this.req_finished = true;
        this.res_finished = true;
        this.res.status(500).end(err);
        return;
    }

    if (!this.req_finished) {       //request in process
        return;
    }

    if (this.res_finished) {        //http connection end or has responsed
        return;
    }

    var all_finished = true;
    var fids         = [];

    for (var i = 0; i < this.files.length; i++) {
        var file = this.files[i];
        if (!file.finished) {       //该文件还未处理完
            all_finished = false;
            break;
        }

        if (file.error) {           //上传出错，则记录出错原因
            fids.push({
                name:  file.name,
                exist: file.exist,
                error: file.error
            });
        } else {
            fids.push({
                fid:  file.fid,
                name: file.name,
                size: file.size,
                hash: file.hash
            });
        }        
    }

    if (!all_finished) {            //有些文件的异步操作未完成
        return;
    }

    console.log("--------------- done -----------------");
    console.log(JSON.stringify(fids, null, 4));
    
    this.res.json(fids);

    this.res_finished = true;
};

module.exports = function (req, res) {
    var uploader = new Uploader(req, res);
};
