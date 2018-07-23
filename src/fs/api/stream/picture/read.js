'use strict';
/*jslint vars : true*/

var Reader_realstream = require("../../../picture/read-realstream.js")
var Reader_backstream = require("../../../picture/read-backstream.js")

module.exports = function(req, res) {
    var flag = req.query.flag;
    var streamid = req.query.streamid;

    if (!streamid || !flag) {
        return res.status(400).end("can't get stearmid or flag");
    }

    //realstream
    if (flag === "1") {
        var reader = new Reader_realstream(req, res);
    }

    //backstream
    if (flag === "0") {
        var reader = new Reader_backstream(req, res);
    }
}