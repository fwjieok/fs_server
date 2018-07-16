'use strict';
var http = require('http');
/*jslint vars:true*/
module.exports = function (req, res) {
    req.app.server.get_runtime(function (runtime) {
        res.end(JSON.stringify(runtime));
    });
};
