'use strict';
/*jslint vars:true*/

var http = require('http');
var fs   = require('fs');
var env  = process.env;

var GATEWAY_RUNTIME_FILE = env.JRAM + "/gateway-runtime.stat";

module.exports = function (req, res) {
    try {
        fs.readFile(GATEWAY_RUNTIME_FILE, function (err, data) {
            if (err) {
                res.end();
                return;
            }
            var r = JSON.parse(data);
            res.send(r["online-devices"]);
        });
    } catch (err) {
        res.end();
    }

};
