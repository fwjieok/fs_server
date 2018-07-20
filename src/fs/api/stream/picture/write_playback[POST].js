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

    this.req_finished = false; //标识请求是否完成
    this.res_finished = false; //标识响应是否完成

    this.streamid = req.headers.streamid;

    /*
    this.block_size = 0; //块大小
    this.block_frames = 0; //块内帧数量
    this.frame_offset = 0; //块内帧偏移
    this.block_buffer = new Buffer(1024 * 1024 * 10); //10M
    this.block_id = uuid(); //块ID
    this.block_meta = {}; //块信息
    */

    this.form = new formidable.IncomingForm();
    this.form.hash = "md5";

    this.form.on('end', this.on_finished.bind(this));
    this.form.on('aborted', this.done.bind(this));
    this.form.on('error', this.done.bind(this));

    this.form.onPart = this.on_part.bind(this);

    /*
    this.writeStream.on('finish', function() {
        console.log("--- writeStream finished ------");
    });
    */

    /*
    this.writeStream.on('drain', function() {
        console.log("--- writeStream drain ------");
    });
    */

    this.form.parse(this.req, this.on_finished.bind(this));
}

Uploader.prototype.on_part = function(part) {
    //console.log(part.filename, part.headers.timestamp);

    var block = {
        bid: uuid(),
        streamid: this.streamid,
        size: 0,
        frames: 0,
        sample_rate: 4,
        t_start: part.headers.timestamp,
        t_end: part.headers.timestamp,
        meta: {}
    };

    var block_path = path.join(fs_root, "/root", block.bid);

    var block_writeStream = fs.createWriteStream(block_path);

    var timestamp = part.headers.timestamp;
    var length = 0;

    var buffer = new Buffer(1024 * 100);
    part.on('data', function(chunk) {
        chunk.copy(buffer, length);
        length += chunk.length;
    });

    part.on('end', function() {
        buffer = buffer.slice(0, length);

        block_writeStream.write(buffer);

        block_writeStream.end();
        block_writeStream.close();

        block.meta['0'] = { offset: block.frame_offset, length: length, timestamp: timestamp };
        block.size = length;
        block.frames = 1;

        /*
        this.block_frames++;
        this.block_size += length;
        this.frame_offset += length;
        */

        this.block_end(block);

    }.bind(this));
}

Uploader.prototype.request_fsc_new = function(block, callback) {
    var protocol = "http";
    var fsc_host = "127.0.0.1";
    var fsc_port = 7000;
    var tid = "COWN-9JH-D9-BKW";

    var url = "%s://%s:%d/block/new";
    url = util.format(url, protocol, fsc_host, fsc_port);

    console.log(url);

    var option = {
        url: url,
        json: true,
        headers: {
            'tid': tid,
            'format': "picture",
            'Content-Type': 'application/json'
        },
        body: block
    };

    request.post(option, callback);
};

Uploader.prototype.block_end = function(block) {

    /*
    this.block_writeStream.end();
    this.block_writeStream.close();

    var t_start = this.block_meta['0'].timestamp;
    var t_end = this.block_meta[this.block_frames - 1].timestamp;

    var req_body = {
        bid: this.block_id,
        streamid: this.streamid,
        size: this.block_size,
        frames: this.block_frames,
        sample_rate: 4,
        t_start: t_start,
        t_end: t_end,
        meta: this.block_meta
    }
    */

    this.request_fsc_new(block, function(err, response, body) {
        if (err) {
            console.log("---------- request_fsc_new error ------------");
            consoel.log(err);
            return this.res.status(500).end();
        }

        if (response.statusCode !== 200) {
            console.log("---------- request_fsc_new fail ------------");
            console.log(response.statusCode, body);
            return this.res.status(response.statusCode).end();
        }

        console.log("---------- request_fsc_new OK ------------");

        //this.req.resume();

    }.bind(this));

    this.req_finished = true; //request end
};

Uploader.prototype.on_finished = function(err, fields, files) {
    if (!this.req_finished) {


        /*

        this.block_writeStream.end();
        this.block_writeStream.close();
        
        var t_start = this.block_meta['0'].timestamp;
        var t_end = this.block_meta[this.block_frames - 1].timestamp;

        var req_body = {
            bid: this.block_id,
            streamid: this.streamid,
            size: this.block_size,
            frames: this.block_frames,
            sample_rate: 4,
            t_start: t_start,
            t_end: t_end,
            meta: this.block_meta
        }

        this.request_fsc_new(req_body, function(err, response, body) {
            if (err) {
                console.log("---------- request_fsc_new error ------------");
                consoel.log(err);
                return this.res.status(500).end();
            }

            if (response.statusCode != 200) {
                console.log("---------- request_fsc_new fail ------------");
                console.log(response.statusCode);
                return this.res.status(response.statusCode).end();
            }

            console.log("---------- request_fsc_new OK ------------");
            this.done();

        }.bind(this));
        */

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

    console.log("------- done block frames: ", this.block_frames);

    this.res.end();

    this.res_finished = true;
}