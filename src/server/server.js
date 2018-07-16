'use strict';
/*jslint vars:true */

var env             = process.env;
var util            = require("util");
var exec            = require('child_process').exec;
var path            = require("path");
var fs              = require("fs");
var os              = require("os");
var Network_monitor = require("./network_monitor.js");
var uptime          = require("./uptime.js");
var global          = require("../common/global.js");
var Db              = require("../common/db-pg.js");

// var SYSTEM_LOG      = env.JVAR   + "/system.log";
var INTERNET_READY  = env.JFLAGS + "/sys-internet-ready";

function Server(config) {
    this.debug              = true;
    this.config             = config;

    this.net_fail           = false;
    this.network_monitor    = null;

    this.db = null;
}

Server.prototype.get_runtime = function (callback) {
    if (typeof callback !== 'function') { return; }
    var runtime = {};

    runtime["sys-uptime"]         = uptime();
    runtime["sys-time"]           = (new Date()).format();
    // runtime["sys-model"]          = this.config.cwcdn.MODEL.toUpperCase();
    runtime["sys-sn"]             = "COWN-XXX-XX-XXX"
    runtime["sys-version"]        = "0.0.0.0";

    runtime["sys-model"]          = "CN8040";
    //runtime["sys-network"]        = this.net_fail?false:true;
    //runtime["sys-internet"]       = fs.existsSync(INTERNET_READY)?true:false;
    
    callback(runtime);
};

Server.prototype.set_beep_monitor = function () {
    var arr = ["beep-internet-monitor", "beep-jingyun-monitor"];
    for (var i = 0; i < arr.length; i ++) {
	var name = arr[i];
	var flag = env.JFLAGS + "/" + name;
        // if (this.config.gateway.system[name]) {
        //     fs.openSync(flag, "w");
        // } else {
        //     if (fs.existsSync(flag)) {
        //         fs.unlinkSync(flag);
        //     }
        // }
    }
};

Server.prototype.run = function () {
    this.log(0, "system", "", "", "系统服务启动");

    this.set_beep_monitor();

    this.db = new Db();
    
    this.network_monitor = new Network_monitor(this);
    this.network_monitor.start();
};

Server.prototype.log = function () {
    var level = -1;
    var first = 0;
    var user, ip, port;
    if (typeof arguments[0] === 'number') {
        level = arguments[0];
        user  = arguments[1] || "";
        ip    = arguments[2] || "";
        port  = arguments[3] || "";
        first = 4;
    }
    if (level !== 0 && !this.debug) { return; };
    var msg = "";
    for (var i = first; i < arguments.length; i++) {
        msg = msg + arguments[i] + " ";
    }
    if (level === 0) {
        msg = (new Date()).format() + ";"
            + user + ";"
            + ip + ";"
            + port + ";"
            + msg;
        //fs.appendFileSync(SYSTEM_LOG, msg + "\n");
        console.log(msg);
    }
    var result = "";
    for (var i = 0; i < msg.length; i++) {
        if (msg[i] < ' ') {
            result = result + "<" + ascii[msg.charCodeAt(i)] + ">";
        } else {
            result = result + msg[i];
        }
    };
    msg = result;
    msg = msg.replace(/[^ -~]/g, "?");
    console.log((new Date()).format(), "[server]", msg);
};

module.exports = Server;
