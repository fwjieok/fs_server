'use strict';
/*jslint vars : true*/

var Stream_session = require("../../stream-session.js");

/*
    
*/
module.exports = function (req, res) {
    var flag     = req.query.flag;
    var streamid = req.query.streamid;
    if (!streamid || !flag) {
        return res.status(400).end("can't get stearmid or flag");
    }


    //realstream
    if (flag === "1") {
        var stream_sessions = req.app.server.stream_sessions;
        var session  = stream_sessions[streamid];
        if (!session) {
            session = new Stream_session(req.app.server);
            stream_sessions[streamid] = session;
        }
  
        console.log("------ on_stream_read: ", streamid);
        session.add_read(req, res);

        return;
    }

    //backstream
    
}   
