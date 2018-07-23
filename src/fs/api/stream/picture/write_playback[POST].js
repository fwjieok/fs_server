'use strict';
/*jslint vars : true*/

var fs = require('fs');
var util = require('util');
var path = require('path');

var uuid = require('uuid/v1');
var request = require('request');
var formidable = require('formidable');

module.exports = function(req, res) {
    var writer = new Writer(req, res);
};

function Writer(req, res) {
    this.req = req;
    this.res = res;

    this.req_finished = false; //标识请求是否完成
    this.res_finished = false; //标识响应是否完成

    this.protocol = req.app.server.protocol;
    this.fsc_host = req.app.server.fsc_host;
    this.fsc_port = req.app.server.fsc_port;

    this.streamid = req.headers.streamid;

    this.form = new formidable.IncomingForm();
    this.form.hash = "md5";

    this.form.on('end', this.on_finished.bind(this));
    this.form.on('aborted', this.done.bind(this));
    this.form.on('error', this.done.bind(this));

    this.form.onPart = this.on_part.bind(this);

    this.form.parse(this.req, this.on_finished.bind(this));
}

Writer.prototype.on_part = function(part) {
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

    var block_path = path.join(this.req.app.server.data_root, block.bid);

    var block_writeStream = fs.createWriteStream(block_path);
    block_writeStream.on('error', function(err) {
        console.log("------------ block_writeStream error --------------");
        console.log(err);
    });

    var timestamp = part.headers.timestamp;
    var length = 0;

    var buffer = new Buffer(1024 * 100);
    part.on('data', function(chunk) {
        chunk.copy(buffer, length);
        length += chunk.length;
    });

    part.on('end', function() {
        buffer = buffer.slice(0, length);

        block.meta['0'] = { offset: block.frame_offset, length: length, timestamp: timestamp };
        block.size = length;
        block.frames = 1;

        block_writeStream.write(buffer, this.block_write_end.bind({ writer: this, block: block }));

    }.bind(this));
}

Writer.prototype.request_fsc_block_new = function(block, callback) {
    var url = "%s://%s:%d/block/new";
    url = util.format(url, this.protocol, this.fsc_host, this.fsc_port);
    //console.log(url);

    var option = {
        url: url,
        json: true,
        headers: {
            'tid': this.req.app.server.tid,
            'format': "picture",
            'Content-Type': 'application/json'
        },
        body: block
    };

    request.post(option, callback);
};

Writer.prototype.block_write_end = function() {
    this.writer.request_fsc_block_new(this.block, function(err, response, body) {
        if (err) {
            console.log("---------- request_fsc_block_new error ------------");
            consoel.log(err);
            retrun;
        }

        if (response.statusCode !== 200) {
            console.log("---------- request_fsc_block_new fail ------------");
            console.log(response.statusCode, body);
            return;
        }
    });
};

Writer.prototype.on_finished = function(err, fields, files) {
    this.req_finished = true; //request end
    this.done();
};

Writer.prototype.done = function(err) {
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

    console.log("------- write palyback done ------------ ");

    this.res.end();

    this.res_finished = true;
}