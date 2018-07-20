'use strict';
/*jslint vars:true*/

var env = process.env;
var path = require("path");

module.exports = function (req, res) {
    res.end("{}");
    return;
    var exec = require('child_process').exec, child;
    var file = path.join(env.JVAR, "system.log");

    child = exec('tail -n 100 ' + file, function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
            res.status(500).end(error);
        } else {
            var result = stdout.split("\n");
            result.reverse();
            res.send(result);
        }
    });
};

