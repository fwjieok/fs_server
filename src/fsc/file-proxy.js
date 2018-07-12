'use strict';
/*jslint vars : true*/
var util      = require('util');
var httpProxy = require('http-proxy');
var proxy     = httpProxy.createProxyServer();

proxy.on('error', function (e) {
    console.log(e);
    res.status(502).end();
});

module.exports = function (req, res) {
    req.app.server.db.get_usable_storage(function (result) {
        // if (err) {
        //     console.error(err);
        //     res.status(500).end();
        //     return;
        // }
	
	if (result.length == 0) {
            console.error("no free space");
            return res.status(503).end();
	}

	var protocol = result[0].protocol;
        var host     = result[0].hostname;
        var port     = result[0].port;
	var target = protocol + '://' + host + ':' + port;
        console.log("proxy to :", target);
        var option = {
            target: target
        };

        if (protocol === 'https') {
	    
	}

	proxy.web(req, res, option);
        proxy.on('proxyReq', function (proxyReq, req, res, options) {
	    console.log("---- proxyReq: ", req.path);
            proxyReq.setHeader('Host', host);
        });
    });
};
