'use strict';
/*jslint vars : true*/

var fs = require('fs');
var util = require('util');
var path = require('path');
var http = require('http');
var request = require('request');
var httpProxy = require('http-proxy');

var BOUNDARY = "----WebKitFormBoundaryIZDrYHwuf2VJdpHw";

function Reader_backstream(req, res) {
    this.req = req;
    this.res = res;
    this.req_finished = false;
    this.res_finished = false;

    this.streamid = req.query.streamid;
    this.from = req.query.from;
    this.to = -1;
    if (req.query.to) {
        this.to = req.query.to;
    }

    if (!this.from) {
        return res.status(400).end("from not valid");
    }

    this.self_tid = this.req.app.server.tid;

    this.req.on('close', this.on_request_finished.bind(this));
    this.req.on('aborted', this.on_request_finished.bind(this));

    this.res.on('close', this.on_response_finished.bind(this));
    this.res.on('finish', this.on_response_finished.bind(this));

    this.block_index = 0;
    this.block_list = [];

    this.request_fsc_block_info();
}

Reader_backstream.prototype.on_request_finished = function() {
    this.req_finished = true;
}

Reader_backstream.prototype.on_response_finished = function() {
    this.res_finished = true;
}

Reader_backstream.prototype.request_fsc_block_info = function() {
    var protocol = this.req.app.server.protocol;
    var fsc_host = this.req.app.server.fsc_host;
    var fsc_port = this.req.app.server.fsc_port;

    var url = "%s://%s:%d/block/info?streamid=%s&from=%s&to=%s";
    url = util.format(url, protocol, fsc_host, fsc_port, encodeURIComponent(this.streamid), this.from, this.to);
    console.log("--- request fsc block info: ", url);

    var option = {
        url: url,
        json: true, //指定response是json
        headers: {
            tid: this.req.app.server.tid,
            format: "picture"
        }
    };

    request(option, function(err, res, body) {
        if (err) {
            console.log("---- request fsc block info error ------");
            console.log(err);
            return this.res.status(500).end();
        }

        if (res.statusCode !== 200) {
            console.log("---- request fsc block info fail ------");
            console.log(res.statusCode, body);
            return this.res.status(res.statusCode).end(body);
        }

        this.block_list = body;
        console.log("query data result length: ", body.length);

        this.send_response_header();

        this.process_block_data();

    }.bind(this));
}

Reader_backstream.prototype.process_block_data = function() {
    if (this.block_index >= this.block_list.length) {
        this.res.end('\r\n--' + BOUNDARY + '--');
        console.log("----- all data itme done -----");
        return;
    }

    var block = this.block_list[this.block_index];

    var storage = block.storage;
    if (storage === this.self_tid) {
        var block_path = path.join(this.req.app.server.data_root, block.bid);
        var buffer = fs.readFile(block_path, function(err, data) {
            if (err) {
                console.log(err);
            } else {
                this.send_part_header(block);
                this.send_part_data(data);
                this.send_part_end();
            }

            this.block_index++;
            setTimeout(this.process_block_data.bind(this), 250);
        }.bind(this));

    } else {
        //代理到block的位置去取, API为专门的取块API

    }
};

Reader_backstream.prototype.send_response_header = function() {
    var headers = {
        'Connection': 'Keep-Alive',
        'Transfer-Encoding': 'chunked',
        'Content-Type': 'multipart/form-data; boundary=' + BOUNDARY,
        'streamid': this.streamid,
        'type': 'picture',
        "format": 'jpeg'
    };

    this.res.writeHead(200, headers);
}

Reader_backstream.prototype.send_part_header = function(block) {
    if (this.res_finished) {
        return;
    }
    var partHeader = "--%s\r\n" +
        "content-disposition: form-data; name=\"filename\"; filename=''\r\n" +
        "content-type:image/jpeg\r\n" +
        "timestamp: %s\r\n" +
        "frames: 1\r\n" +
        "sample-rate: 4\r\n" +
        "\r\n";

    partHeader = util.format(partHeader, BOUNDARY, block.t_start);

    this.res.write(partHeader);
}

Reader_backstream.prototype.send_part_data = function(chunk) {
    if (this.res_finished) {
        return;
    }

    this.res.write(chunk);
}

Reader_backstream.prototype.send_part_end = function() {
    if (this.res_finished) {
        return;
    }

    this.res.write("\r\n");

    //this.index++;
    //setTimeout(this.process_item.bind(this), 100);
}


module.exports = Reader_backstream;