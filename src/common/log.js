'use strict';
/*jslint vars:true */

var env  = process.env;
var util = require("util");
var path = require("path");
var fs   = require("fs");
var os   = require("os");

var SYSTEM_LOG = path.join(env.JVAR, "system.log");

module.exports = function() {
    var level = -1;
    var first = 0;
    var user, ip, port;
    if (typeof arguments[0] === 'number') {
        level = arguments[0];
        user = arguments[1] || "";
        ip = arguments[2] || "";
        port = arguments[3] || "";
        first = 4;
    }
    if (level !== 0 && !this.debug) { return; };
    var msg = "";
    for (var i = first; i < arguments.length; i++) {
        msg = msg + arguments[i] + " ";
    }
    if (level === 0) {
        msg = (new Date()).format() + ";" +
            user + ";" +
            ip + ";" +
            port + ";" +
            msg;
        fs.appendFileSync(SYSTEM_LOG, msg + "\n");
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
