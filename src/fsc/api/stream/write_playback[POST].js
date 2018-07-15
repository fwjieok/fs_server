'use strict';
/*jslint vars : true*/

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer();

proxy.on('error', function (e) {
    console.log(e);
    res.status(502).end();
});

module.exports = function (req, res) {
  var option = {
    //target: "http://172.18.248.217:7001"
    target: "http://127.0.0.1:7001"
  };

  proxy.web(req, res, option);
  proxy.on('proxyReq', function (proxyReq, req, res, options) {
    console.log("------------------ proxyReq: ", req.path);
  });
}
