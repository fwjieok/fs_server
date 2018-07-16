'use strict';
/*jslint vars:true, sub:true, node:true, nomen: true, maxlen: 160, plusplus:true, stupid:true*/

var util         = require('util');
var EventEmitter = require('events').EventEmitter;

function Session(streamid, server) {
  //this.debug     = true;
  this.streamid   = streamid;
  this.server     = server;
  this.uptime     = new Date();
  this.authed     = null;

  this.read_sessions  = {};               //读列表
  this.write_session  = null;             //写: 实时流(转发)
}

util.inherits(Session, EventEmitter);

function Read_session(sessionId, req, res) {
    this.sessionId     = sessionId;       //读流可能有多个
    this.req           = req;
    this.res           = res;
    this.flag          = req.query.flag;
    this.streamid      = req.query.streamid;
    this.header_setted = false;
    this.valid         = true;

    function on_read_close () {
      this.valid = false;
      this.emit("close", this.sessionId);
    };

    this.req.on("close",   on_read_close.bind(this));
    this.req.on("aborted", on_read_close.bind(this));
}

util.inherits(Read_session, Session);

function Write_session(session, req, res) {
    this.session  = session;
    this.req      = req;
    this.res      = res;
    this.headers  = req.headers;
    this.streamid = req.headers['streamid'];
    this.type     = req.headers['type'];
    this.format   = req.headers['format'];

    this.req.on("data",    this.on_write_data.bind(this.session));
    this.req.on("close",   this.on_write_close.bind(this.session));
    this.req.on("aborted", this.on_write_close.bind(this.session));

    this.req.on("end", function () {
        console.log("--- push realstream end -----");
        this.res.end();
        this.emit('close');
    }.bind(this));
}

util.inherits(Write_session, Session);

Session.prototype.add_read = function (req, res) {
    var sid      = this.new_session_id();
    var session  = new Read_session(sid, req, res);
    this.read_sessions[sid] = session;

    session.on("close", this.on_read_close.bind(this));

    var flag = req.query.flag;
    if (this.write_session && flag === "1") {
        res.writeHead(200, this.write_session.headers);
        session.header_setted = true;
    }
};

Session.prototype.add_write = function (req, res) {
    if (this.write_session) {
        delete this.write_session;
        this.write_session = null;
    }
  
    this.write_session = new Write_session(this, req, res);
    this.write_session.on('close', this.on_write_close.bind(this));

    for (var rss_id in this.read_sessions) {
        var rss = this.read_sessions[rss_id];
        if (this.flag === "1" && !rss.header_setted) {
            rss.res.writeHead(200, this.write_session.headers);
            rss.header_setted = true;
        }
    }
};

Session.prototype.on_read_close = function (sessionId) {
    console.log("--------- on_read_close ---------");
    if (this.read_sessions[sessionId]) {
        delete this.read_sessions[sessionId];
    }
};

Session.prototype.on_write_close = function () {
    if (this.write_session) {
        delete this.write_session
        this.write_session = null;
    }
};

Session.prototype.on_write_data = function (chunk) {
    for (var rss_id in this.read_sessions) {
        var rss = this.read_sessions[rss_id];
        if (rss.flag === "1") {
            rss.res.write(chunk, function () {
                console.log("--- write chunk OK");
            });
        }
    }

};

Session.prototype.new_session_id = function () {
    var s;
    s = (Math.random() * 10000).toFixed(0);
    s = s + '-' + (Math.random() * 10000).toFixed(0);
    return s;
};

module.exports = Session;