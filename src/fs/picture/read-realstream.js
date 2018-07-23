'use strict';
/*jslint vars : true*/

var fs = require('fs');
var util = require('util');
var http = require('http');
var request = require('request');

function Reader_realstream(req, res) {
    this.req = req;
    this.res = res;

    this.streamid = req.query.streamid;
    this.self_tid = req.app.server.tid;
    this.protocol = req.app.server.protocol;
    this.fsc_host = req.app.server.fsc_host;
    this.fsc_port = req.app.server.fsc_port;

    this.check_interval = 500;
    this.timeout = 5 * 2; //5秒没有查找到写实时流端就返回

    this.on_read_realstream();
}

Reader_realstream.prototype.on_read_realstream = function() {
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
        headers: { 'tid': this.self_tid }
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
            if (response.statusCode === 404) {
                if (this.timeout == 0) {
                    return this.res.status(response.statusCode).end();
                }
                this.timeout--;
                console.log("---- request fsc stream session 404 ------");
                return setTimeout(this.on_read_realstream.bind(this), this.check_interval);
            }

            console.log("---- request fsc stream session fail: ", response.statusCode);
            return this.res.status(response.statusCode).end();
        }

        body = JSON.parse(body);

        if (body.tid === this.self_tid) {
            console.log("------ fsc get stream session is self");
            var session_list = this.req.app.server.stream_sessions;
            var session = session_list[this.streamid];
            if (session) {
                console.log("------ on_realstream_read: ", this.streamid);
                return session.add_read(this.req, this.res);
            }
        } else {
            console.log("------ fsc get stream session is other");

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

module.exports = Reader_realstream;