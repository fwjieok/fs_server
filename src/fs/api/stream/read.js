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

/*
Reader.prototype.on_read_backstream = function() {
    this.req_finished = false;
    this.res_finished = false;

    this.from = req.query.from;
    if (req.query.to) {
        this.to = req.query.to;
    }

    if (!this.from) {
        return res.status(400).end("from not valid");
    }

    this.req.on('close', this.on_request_finished.bind(this));
    this.req.on('aborted', this.on_request_finished.bind(this));

    this.res.on('close', this.on_response_finished.bind(this));
    this.res.on('finish', this.on_response_finished.bind(this));

    this.index = 0;
    this.data_list = [];
    this.query_data();
}

Reader.prototype.on_request_finished = function() {
    this.req_finished = true;
}

Reader.prototype.on_response_finished = function() {
    this.res_finished = true;
}

Reader.prototype.query_data = function() {
    var sql = "select storage.protocol, storage.hostname, storage.port, fid.hash, fid.fname " +
        "from fid join storage " +
        "on fid.storage = storage.tid " +
        "where fid.fname >= '2018-07-16 11:56:56.747' and fid.fname <= '2018-07-16 11:57:59.676' ORDER BY fname ASC LIMIT 1000 OFFSET 0";

    var params = [];
    this.req.app.server.db.query(sql, params, function(err, result) {
        if (err) {
            console.error(err);
            return this.res.status(500).end("FAIL");
        }

        if (result.rows.length == 0) {
            return this.res.status.status(404).end();
        }

        console.log("query data result length: ", result.rows.length);
        this.data_list = result.rows;

        this.res.writeHead(200, {
            'Connection': 'Keep-Alive',
            'Transfer-Encoding': 'chunked',
            'Content-Type': 'multipart/form-data; boundary=' + BOUNDARY,
            'streamid': this.streamid,
            'type': 'picture',
            "format": 'jpeg'
        });

        this.index = 0;
        this.process_item(this.index);

    }.bind(this));
}

Reader.prototype.send_part_header = function() {
    if (this.res_finished) {
        return;
    }
    var partHeader = "--%s\r\n" +
        "content-disposition: form-data; name=\"filename\"; filename=%s\r\n" +
        "content-type:image/jpeg\r\n" +
        "datetime: %s\r\n" +
        "timestamp: %s\r\n" +
        "frames: 1\r\n" +
        "sample-rate: 4\r\n" +
        "\r\n";

    partHeader = util.format(partHeader,
        BOUNDARY,
        this.data_list[this.index].fname,
        this.data_list[this.index].fname,
        (new Date(this.data_list[this.index].fname)).valueOf(),
    );

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

Reader.prototype.process_item = function() {
    if (this.index >= this.data_list.length) {
        this.res.end('\r\n--' + BOUNDARY + '--');
        console.log("all data itme done");
        return;
    }

    var item = this.data_list[this.index];

    var protocol = item.protocol;
    var hostname = item.hostname;
    var port = item.port;

    var url = "http://127.0.0.1:7001/stream/read?hash=%s&fname=%s";
    url = util.format(url, item.hash, item.fname);

    var req = http.get(url, function(res) {

        this.send_part_header();

        res.on('data', this.send_part_data.bind(this));
        res.on('end', this.send_part_end.bind(this));
    }.bind(this));

    req.on('error', function(error) {
        console.log("-------------- http get file from fs error --------------");
        console.log(error);

        this.process_item();
    }.bind(this));
};

Reader.prototype.request_fsc = function(url, callback) {
    var option = {
        url: url,
        headers: {
            'tid': tid
        }
    };

    request(option, function(err, res, body) {
        if (err) {
            console.log("---- request fsc stream session error ------");
            console.log(err);
            return this.res.status(500).end();
        }

        if (res.statusCode !== 200) {
            console.log("---- request fsc stream session fail ------");
            console.log(res.statusCode, body);
            return this.res.status(500).end();
        }

        if (callback) { callback(body); }

    });
}

*/