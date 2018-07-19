'use strict';
/*jslint vars : true*/

var fs = require('fs');
var util = require('util');
var path = require('path');

var uuid = require('uuid/v1');
var request = require('request');
var formidable = require('formidable');

var FSC = process.env.FSC;
FSC = "http://127.0.0.1:7000";

var fs_root = process.env.HOME + "/.fs";

module.exports = function(req, res) {
    var uploader = new Uploader(req, res);
};

function Uploader(req, res) {
    this.req = req;
    this.res = res;
    this.files = [];

    this.req_finished = false; //标识请求是否完成
    this.res_finished = false; //标识响应是否完成

    this.block_frames = 0;
    this.block_offset = 0;
    this.block_buffer = new Buffer(1024 * 1024);
    this.block_size = 0;
    this.block_id = 0;
    this.block_meta = {};

    this.form = new formidable.IncomingForm();
    this.form.hash = "md5";

    this.form.on('end', this.on_finished.bind(this));
    this.form.on('aborted', this.done.bind(this));
    this.form.on('error', this.done.bind(this));

    this.form.onPart = this.on_part.bind(this);

    this.writeStream = fs.createWriteStream(fs_root + "/inbox/" + "test_block");

    this.form.parse(this.req, this.on_finished.bind(this));
}

Uploader.prototype.on_part = function(part) {
    console.log(part.filename, part.headers.timestamp);

    var length = 0;
    var buffer = new Buffer(1024 * 100);
    part.on('data', function(chunk) {
        chunk.copy(buffer, length);
        length += chunk.length;
    });

    part.on('end', function() {
        console.log("------------ end: ", length);
        buffer = buffer.slice(0, length);
        console.log("------------ splice: ", buffer.length);

        //fs.writeFile(length + ".jpg", buffer);

        this.writeStream.write(buffer);

        this.block_meta[this.block_frames] = { offset: this.block_offset, length: length };
        this.block_frames++;

        this.block_offset += buffer.length;
        console.log("--- this.block_offset: ", this.block_offset);

    }.bind(this));
}

Uploader.prototype.request_fsc_new = function(file, callback) {
    var protocol = "http";
    var fsc_host = "127.0.0.1";
    var fsc_port = 7000;
    var tid      = "COWN-123-45-678";
        
    var url = "%s://%s:%d/block/new";
    url = util.format(url, protocol, fsc_host, fsc_port);

    console.log(url);

    var option = {
        url: url,
        headers: {
            tid: tid,
            
        }
    };

    if (this.req.app.server.protocol == "https") {
        option.cert = this.tls.cert;
        option.key = this.tls.key;
        option.ca = this.tls.ca;
    }

    request(option, callback);
};

Uploader.prototype.on_finished = function(err, fields, files) {
    if (!this.req_finished) {
        this.writeStream.close();
        fs.writeFile("./block_meta.json", JSON.stringify(this.block_meta));
        this.req_finished = true; //request end
    }

    this.done();
};

Uploader.prototype.done = function(err) {
    if (err) { //request error or abort
        console.error(err);
        this.req_finished = true;
        this.res_finished = true;
        this.res.status(500).end(JSON.stringify(err));
        return;
    }

    if (!this.req_finished) { //request in process
        return;
    }

    if (this.res_finished) { //http connection end or has responsed
        return;
    }

    var count = 0;
    var all_finished = true;

    if (!all_finished) { //有些文件的异步操作未完成
        return;
    }

    console.log("--------------- done -----------------");
    console.log(count);

    this.res.end();

    this.res_finished = true;
}
