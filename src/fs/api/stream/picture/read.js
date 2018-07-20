'use strict';
/*jslint vars : true*/

var fs = require('fs');
var util = require('util');
var http = require('http');
var request = require('request');
var httpProxy = require('http-proxy');

var tid = "COWN-9JH-D9-BKW";
var BOUNDARY = "----WebKitFormBoundaryIZDrYHwuf2VJdpHw";

var fs_root = process.env.HOME + "/.fs";

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

Reader.prototype.on_read_realstream = function() {
    /*
        read realstram
        1. 查看streamid对应的writer是否在自身（只有writer能创建session，如果读端先到则）
        2. 如果在，直接处理，如果不在请求fsc获取streamid对应的fs
        3. 如果fs不是自已就proxy到target
   */
    var session_list = this.req.app.server.stream_sessions;
    var session = session_list[this.streamid];
    if (session) {
        console.log("------ on_realstream_read: ", this.streamid);
        return session.add_read(this.req, this.res);
    }

    var url = "http://%s:%d/stream/stream-session?action=%s&streamid=%s";
    url = util.format(url, this.fsc_host, this.fsc_port, "get", this.streamid);
    var option = {
        url: url,
        headers: { 'tid': tid }
    };

    console.log("---- request fsc: ", url);

    request(option, function(err, response, body) {
        if (err) {
            console.log("---- request fsc stream session error ------");
            console.log(err);
            return this.res.status(500).end();
        }

        //404 ——— 读端先到，写端还未到
        if (response.statusCode !== 200) {
            if (this.timeout == 0) {
                return this.res.status(response.statusCode).end();
            }
            this.timeout--;
            console.log("---- request fsc stream session 404 ------");
            return setTimeout(this.on_read_realstream.bind(this), 1000);
        }

        body = JSON.parse(body);

        if (body.tid === this.self_tid) {
            console.log("------ fsc get stream session is self");
            var session_list = this.req.app.server.stream_sessions;
            var session = session_list[this.streamid];
            if (session) {
                console.log("------ on_realstream_read: ", streamid);
                return session.add_read(this.req, this.res);
            }
        } else {
            var proxy = httpProxy.createProxyServer();
            var target = body.protocol + '://' + body.ip + ':' + body.port;
            console.log("---- fs proxy to :", target);
            var option = {
                target: target
            };
            proxy.web(this.req, this.res, option);
            proxy.on('proxyReq', function(proxyReq, req, res, options) {
                proxyReq.setHeader('Host', host);
            });
        }
    }.bind(this));
}

Reader.prototype.on_read_backstream = function() {
    this.req_finished = false;
    this.res_finished = false;

    /*
    this.from = req.query.from;
    this.to = -1;
    if (req.query.to) {
        this.to = req.query.to;
    }
    */

    /*
    if (!this.from) {
        return res.status(400).end("from not valid");
    }
    */

    this.req.on('close', this.on_request_finished.bind(this));
    this.req.on('aborted', this.on_request_finished.bind(this));

    this.res.on('close', this.on_response_finished.bind(this));
    this.res.on('finish', this.on_response_finished.bind(this));

    this.block_index = 0;
    this.block_list = [];
    this.query_data_and_process();
}

Reader.prototype.on_request_finished = function() {
    this.req_finished = true;
}

Reader.prototype.on_response_finished = function() {
    this.res_finished = true;
}

Reader.prototype.query_data_and_process = function() {
    this.request_fsc_info(function(body) {
        console.log("-------------- request fsc info ok --------------");

        this.block_list = body;
        console.log("query data result length: ", body.length);

        this.send_response_header();

        this.block_index = 0;
        this.process_block_data();

    }.bind(this));
}

Reader.prototype.process_block_data = function() {
    if (this.block_index >= this.block_list.length) {
        this.res.end('\r\n--' + BOUNDARY + '--');
        console.log("all data itme done");
        return;
    }


    var block = this.block_list[this.block_index];

    //console.log(this.block_index);
    var storage = block.storage;

    var block_path = fs_root + "/root/" + block.bid;

    var buffer = fs.readFile(block_path, function(err, data) {
        if (err) {
            console.log(err);
        } else {
            this.send_part_header(block);
            this.send_part_data(data);
            this.send_part_end();
        }

        this.block_index++;
        setTimeout(this.process_block_data.bind(this), 100);
    }.bind(this));

    //console.log(typeof buffer, buffer.length);
};

Reader.prototype.send_response_header = function() {
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

Reader.prototype.send_part_header = function(block) {
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

Reader.prototype.send_part_data = function(chunk) {
    if (this.res_finished) {
        return;
    }

    this.res.write(chunk);
}

Reader.prototype.send_part_end = function() {
    if (this.res_finished) {
        return;
    }

    this.res.write("\r\n");

    //this.index++;
    //setTimeout(this.process_item.bind(this), 100);
}



Reader.prototype.request_fsc_info = function(callback) {
    this.fsc_host = "127.0.0.1";
    this.fsc_port = 7000;

    var url = "http://%s:%d/block/info?streamid=%s&from=%s&to=%s";

    url = util.format(url, this.fsc_host, this.fsc_port, encodeURIComponent(this.streamid), "1532004487816", "1532004591986");
    console.log("--- request fsc info: ", url);

    var option = {
        url: url,
        headers: {
            tid: tid,
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
            return this.res.status(500).end(body);
        }

        try {
            body = JSON.parse(body);
        } catch (e) {
            console.log(e);
            return;
        }

        if (callback) { callback(body); }

    }.bind(this));
}