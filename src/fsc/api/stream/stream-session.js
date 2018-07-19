'use strict';
/*jslint vars : true*/

module.exports = function(req, res) {
    var tid = req.headers.tid;
    var action = req.query.action;
    var streamid = req.query.streamid;
    if (!tid || !action || !streamid) {
        console.log("------ on_stream_session error: ", tid, action, streamid);
        return res.status(400).end("tid, flag or streamid not valid");
    }

    var session_list = req.app.server.stream_sessions;

    if (action === "get") {
        var session = session_list[streamid];
        if (session) {
            res.send(session);
        } else {
            res.status(404).end();
        }
    } else if (action === "add") {
        session_list[streamid] = {
            tid: tid,
            protocol: "http",
            ip: "127.0.0.1",
            port: 7001
        };
        res.end();
    } else if (action === "remove") {
        delete session_list[streamid];
        res.end();
    }

    console.log("------ on_stream_session: ", action);
}