'use strict';
/*jslint vars : true*/

var util = require("util");
var request = require("request");
var Stream_session = require("../../stream-session.js");
var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

var tid = "COWN-123-45-FS1";

module.exports = function(req, res) {
    var writer = new Writer(req, res);
};

function Writer(req, res) {
    this.req = req;
    this.res = res;

    var flag = req.headers.flag;
    var streamid = req.headers.streamid;

    /*
    if (!streamid || flag !== "1") {
        return res.status(404).end("flag or streamid not valid");
    }
    */

    if (!streamid) {
        console.log("flag or streamid not valid")
        return res.status(400).end("flag or streamid not valid");
    }

    var fsc_host = "127.0.0.1";
    var fsc_port = 7000;

    /*
    var work_mode = config['work-mode'];
    if (work_mode === 'fs') {
        fsc_host = config['fsc-host'];
        fsc_port = config['fsc-port'];
    }
    */

    //realstream
    /*
        write
        1.保存session，请求fsc添加streamid对应的fs
        2.实时流writer结束,请求fsc删除streamid对应的fs
        3.删除reader_list
        read
        1. 请求fsc获取streamid对应的fs
        2. 如果fs是自已就直接将reader添加进reader_list
        3. 如果fs不是自已就proxy到target
   */
    var url = "http://%s:%d/stream/stream-session?action=%s&streamid=%s";
    url = util.format(url, fsc_host, fsc_port, "add", streamid);

    console.log("----- request fsc stream session: add ", url);
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

        var session_list = this.req.app.server.stream_sessions;
        var session = session_list[streamid];
        if (!session) {
            session = new Stream_session(streamid, this.req.app.server);
            session_list[streamid] = session;
        }

        console.log("------ on_realstream_write: ", streamid);
        session.add_write(this.req, this.res);

    }.bind(this));
};