'use strict';
/*jslint vars : true*/

var Stream_session = require("../../stream-session.js");
var httpProxy      = require('http-proxy');
var proxy          = httpProxy.createProxyServer();

module.exports = function (req, res) {
    //var flag     = req.headers.flag;
    var streamid = req.headers.streamid;

    if (!streamid) {
        return res.status(404).end("flag or streamid not valid");
    }

    //realstream
    //if (flag === "1") {
        var stream_sessions = req.app.server.stream_sessions;
        var session = stream_sessions[streamid];
        if (!session) {
            session = new Stream_session(req.app.server);
            stream_sessions[streamid] = session;
        }

        console.log("------ on_realstream_write: ", streamid);
        session.add_write(req, res);
        return;
    //}

    return;

    //backstream
    if (flag === "0") {
        //代理转发给fs进行存储
        var option = {
            //target: "http://172.18.248.217:7001"
            target: "http://127.0.0.1:7001"
        };
    
        proxy.web(req, res, option);
        proxy.on('proxyReq', function (proxyReq, req, res, options) {
            console.log("------------------ proxyReq: ", req.path);
        });
    }
}
