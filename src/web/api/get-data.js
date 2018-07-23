'use strict';
/*jslint vars:true*/

var httpProxy = require('http-proxy');

module.exports = function (req, res) {
    var config   = req.app.config;
    var fsc_host = config.sys['fsc-host'];
    var fsc_port = config.sys['fsc-port'];
    var self_tid = req.app.config.cwcdn.TID;

    var proxy = httpProxy.createProxyServer();
    var target = 'http://' + fsc_host + ':' + fsc_port;
    console.log("---- web proxy to :", target);
    var option = {
        target: target
    };

    proxy.web(req, res, option);

    proxy.on('error', function(err, req, res) {
        console.log("--- proxy error ------");
	console.log(err);
        res.status(500).end();
    });

    proxy.on('proxyReq', function(proxyReq, req, res, options) {
        proxyReq.setHeader('Host', fsc_host);
	proxyReq.setHeader('TID',  self_tid);

	var query = "";
	for (var key in req.query) {
	    query += key + "=" + req.query[key] + "&";
	}
	query = query.substring(0, query.length - 1);
	
	proxyReq.path = "/block/info-web?" + query;
    });
};

