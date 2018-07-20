'use strict';
/*jslint vars:true*/

var fs            = require("fs");
var path          = require("path");
var env           = process.env;
var uptime        = require("../../common/uptime.js");

var internet_flag = path.join(env.JFLAGS, "sys-internet-ready");
var network_flag  = path.join(env.JFLAGS, "sys-net-ready");

module.exports = function (req, res) {
    var runtime = {};

    runtime["sys-uptime"]   = uptime();
    runtime["sys-time"]     = (new Date()).format();
    runtime["sys-model"]    = req.app.config.cwcdn.MODEL.toUpperCase();
    runtime["sys-sn"]       = req.app.config.cwcdn.TID;
    runtime["sys-version"]  = req.app.config.cwcdn.VERSION;
    runtime["sys-network"]  = req.app.net_fail ? false : true;
    runtime["sys-internet"] = fs.existsSync(internet_flag) ? true : false;

    res.send(runtime);
};
