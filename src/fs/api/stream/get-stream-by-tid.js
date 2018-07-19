'use strict';
/*jslint vars : true*/

var httpProxy = require('http-proxy');


module.exports = function(req, res) {

    var fsc_host = "127.0.0.1";
    var fsc_port = 7000;

    var work_mode = config['work-mode'];
    if (work_mode === 'fsc-fs') {


    } else if (work_mode === 'fs') {
        fsc_host = config['fsc-host'];
        fsc_port = config['fsc-port'];
    }

    var proxy = httpProxy.createProxyServer();

    var target = req.app.server.protocol + '://' + host + ':' + port;
    console.log("---- fs proxy to :", target);
    var option = {
        target: target
    };

    proxy.web(req, res, option);
    proxy.on('proxyReq', function(proxyReq, req, res, options) {
        proxyReq.setHeader('Host', host);
    });
};