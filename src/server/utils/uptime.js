'use strict';
/*jslint vars:true */

var os = require("os");

function uptime() {
    var t       = os.uptime();

    var day     = Math.trunc(t / 86400);
    var hours   = Math.trunc((t % 86400) / 3600);
    var minutes = Math.trunc((t % 3600) / 60);
    var seconds = Math.trunc(t % 60);
    var result  = "";
    if (day)     { result = result + day + "天"; }
    if (hours)   { result = result + hours + "小时"; }
    if (minutes) { result = result + minutes + "分"; }
    if (seconds) { result = result + seconds + "秒"; }

    return result;
}

module.exports = uptime;
