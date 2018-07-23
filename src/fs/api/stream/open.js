'use strict';
/*jslint vars : true*/

var httpProxy = require('http-proxy');

module.exports = function(req, res) {
    var protocol = req.app.server.protocol;
    var fsc_host = req.app.server.fsc_host;
    var fsc_port = req.app.server.fsc_port;

    var proxy = httpProxy.createProxyServer();

    var target = protocol + '://' + fsc_host + ':' + fsc_port;
    console.log("---- fs proxy to :", target);
    var option = {
        target: target
    };

    proxy.web(req, res, option);

    proxy.on('error', function(err, req, res) {
        console.log("--- proxy error ------");
        res.status(500).end();
    });

    proxy.on('proxyReq', function(proxyReq, req, res, options) {
        proxyReq.setHeader('Host', fsc_host);
    });

};