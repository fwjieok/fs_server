'use strict';
/*jslint vars : true*/

var fs = require('fs');
var util = require('util');
var http = require('http');
var request = require('request');
var httpProxy = require('http-proxy');

var tid = "COWN-123-45-FS1";
var BOUNDARY = "----WebKitFormBoundaryIZDrYHwuf2VJdpHw";

module.exports = function(req, res) {
    var flag = req.query.flag;
    var streamid = req.query.streamid;
    if (!streamid || !flag) {
        return res.status(400).end("can't get stearmid or flag");
    }

    var reader = new Reader(req, res);
}

function Reader(req, res) {
    this.req = req;
    this.res = res;
    this.self_tid = tid;

    this.flag = req.query.flag;
    this.streamid = req.query.streamid;

    this.fsc_host = "127.0.0.1";
    this.fsc_port = 7000;

    /*
    var work_mode = config['work-mode'];
    if (work_mode === 'fs') {
        this.fsc_host = config['fsc-host'];
        this.fsc_port = config['fsc-port'];
    }
    */

    //realstream
    if (this.flag === "1") {
        this.timeout = 5; //5秒没有查找到写实时流端就返回
        this.on_read_realstream();
    }

    //backstream
    if (this.flag === "0") {
        this.on_read_backstream();
    }
}


Reader.prototype.on_read_backstream = function() {
    this.req_finished = false;
    this.res_finished = false;


    this.req.on('close', this.on_request_finished.bind(this));
    this.req.on('aborted', this.on_request_finished.bind(this));

    this.res.on('close', this.on_response_finished.bind(this));
    this.res.on('finish', this.on_response_finished.bind(this));

    this.block_meta = JSON.parse(fs.readFileSync("./block_meta.json"));

    var fs_root = process.env.HOME + "/.fs";

    this.block_fd = fs.openSync(fs_root + "/inbox/test_block", "r");
    if (this.block_fd < 0) {
        return this.res.status(500).end("open block error");
    }

    this.res.writeHead(200, {
        'Connection': 'Keep-Alive',
        'Transfer-Encoding': 'chunked',
        'Content-Type': 'multipart/form-data; boundary=' + BOUNDARY,
        'streamid': this.streamid,
        'type': 'picture',
        "format": 'jpeg'
    });

    this.frame_index = 0;
    this.get_block_frame();
}

Reader.prototype.on_request_finished = function() {
    this.req_finished = true;
}

Reader.prototype.on_response_finished = function() {
    this.res_finished = true;
}

Reader.prototype.get_block_frame = function() {
    if (this.frame_index > 239) {
        this.res.end('\r\n--' + BOUNDARY + '--');
        console.log("all data send done");
        return;
    }

    var frame = this.block_meta[this.frame_index];
    var buffer = new Buffer(1024 * 100);
    fs.read(this.block_fd, buffer, 0, frame.length, frame.offset, function(err, bytesRead, buffer) {
        console.log("------------- read: ", this.frame_index, bytesRead);

        //var fd = fs.openSync(this.frame_index + ".jpg", "w+");
        //fs.writeSync(fd, buffer, 0, bytesRead);

        this.send_part_header();
        this.send_part_data(buffer);
        this.res.write("\r\n");

        this.frame_index++;
        setTimeout(this.get_block_frame.bind(this), 100);

    }.bind(this));
}

Reader.prototype.send_part_header = function() {
    if (this.res_finished) {
        return;
    }
    var partHeader = "--%s\r\n" +
        "content-type:image/jpeg\r\n" +
        "timestamp: %s\r\n" +
        "frames: 1\r\n" +
        "sample-rate: 4\r\n" +
        "\r\n";

    partHeader = util.format(partHeader,
        BOUNDARY,
        (new Date().valueOf()));

    this.res.write(partHeader);
}

Reader.prototype.send_part_data = function(chunk) {
    if (this.res_finished) {
        return;
    }

    this.res.write(chunk);
}

Reader.prototype.send_part_end = function(chunk) {
    if (this.res_finished) {
        return;
    }

    this.res.write("\r\n");
    this.index++;
    setTimeout(this.process_item.bind(this), 100);
}