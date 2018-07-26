'use strict';
/*jslint vars:true, sub:true, node:true, nomen: true, plusplus:true, stupid:true*/

var util = require('util');
var request = require('request');
var EventEmitter = require('events').EventEmitter;

function Session(streamid, server) {
    //this.debug     = true;
    this.streamid = streamid;
    this.server = server;
    this.uptime = new Date();

    this.read_sessions = {}; //读列表
    this.write_session = null; //写: 实时流(转发)
}

util.inherits(Session, EventEmitter);

function Read_session(sessionId, req, res) {
    this.sessionId = sessionId; //读流可能有多个
    this.req = req;
    this.res = res;
    this.flag = req.query.flag;
    this.streamid = req.query.streamid;
    this.header_setted = false; //是否已经发送过header

    function on_read_close() {
        this.emit("close", this.sessionId);
    };

    this.req.on("close", on_read_close.bind(this));
    this.req.on("aborted", on_read_close.bind(this));
}

util.inherits(Read_session, Session);

function Write_session(session, req, res) {
    this.session = session;
    this.req = req;
    this.res = res;
    this.headers = req.headers;

    this.req.on("data", this.on_write_data.bind(this.session));
    this.req.on("close", this.on_write_close.bind(this.session));
    this.req.on("aborted", this.on_write_close.bind(this.session));

    this.req.on("end", function() {
        console.log("--- push realstream end -----");
        this.res.end();
        this.emit('close');
    }.bind(this));
}

util.inherits(Write_session, Session);

Session.prototype.add_read = function(req, res) {
    var sid = this.new_session_id();
    var session = new Read_session(sid, req, res);
    this.read_sessions[sid] = session;

    session.on("close", this.on_read_close.bind(this));

    var flag = req.query.flag;
    if (this.write_session) {
        res.writeHead(200, this.write_session.headers);
        session.header_setted = true;
    }
};

Session.prototype.add_write = function(req, res) {
    if (this.write_session) {
        delete this.write_session;
        this.write_session = null;
    }

    this.write_session = new Write_session(this, req, res);
    this.write_session.on('close', this.on_write_close.bind(this));

    for (var rss_id in this.read_sessions) {
        var rss = this.read_sessions[rss_id];
        if (!rss.header_setted) {
            rss.res.writeHead(200, this.write_session.headers);
            rss.header_setted = true;
        }
    }
};

Session.prototype.on_read_close = function(sessionId) {
    console.log("--------- on_read_close ---------");
    if (this.read_sessions[sessionId]) {
        delete this.read_sessions[sessionId];
    }
};

Session.prototype.on_write_close = function() {
    if (this.write_session) {
        delete this.write_session
        this.write_session = null;
    }

    /*
    for (var rss_id in this.read_sessions) {
        var rss = this.read_sessions[rss_id];
        if (rss.flag === "1") {
            //rss.res.end();
            //delete this.read_sessions[rss_id];
        }
    }
    */

    var url = "http://%s:%d/stream/stream-session?action=%s&streamid=%s";
    url = util.format(url, this.server.fsc_host, this.server.fsc_port, "remove", this.streamid);

    console.log(url);
    var option = {
        url: url,
        headers: {
            'tid': this.server.tid
        }
    };

    request(option, function(err, res, body) {
        if (err) {
            console.log("---- request fsc stream session remove error ------");
            console.log(err);
            return this.res.status(500).end();
        }

        if (res.statusCode !== 200) {
            console.log("---- request fsc stream session remove fail ------");
            console.log(res.statusCode, body);
        }

        console.log("---- request fsc stream session remove OK ------");
    });
};

Session.prototype.on_write_data = function(chunk) {
    for (var rss_id in this.read_sessions) {
        var rss = this.read_sessions[rss_id];
        rss.res.write(chunk);
    }
};

Session.prototype.new_session_id = function() {
    var s;
    s = (Math.random() * 10000).toFixed(0);
    s = s + '-' + (Math.random() * 10000).toFixed(0);
    return s;
};

module.exports = Session;
