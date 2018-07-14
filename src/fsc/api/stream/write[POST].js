'use strict';
/*jslint vars : true*/

var Stream_session = require("../../stream-session.js");

/*

*/

module.exports = function (req, res) {
    var streamid = req.headers.streamid;
    if (!streamid) {
        return res.status(404).end();
    }

    var stream_sessions = req.app.server.stream_sessions;
    var session  = stream_sessions[streamid];
    if (!session) {
        session = new Stream_session(req.app.server);
        stream_sessions[streamid] = session;
    }

    console.log("------ on_stream_write: ", streamid);
    session.add_write(req, res);
}
