'use strict';
/*jslint vars:true, sub:true, node:true, nomen: true, maxlen: 160, plusplus:true, stupid:true*/

var util         = require('util');
var EventEmitter = require('events').EventEmitter;

function Session(streamid, server) {
  //this.debug     = true;
  this.server     = server;
  this.uptime     = new Date();
  this.authed     = null;

  this.count = 0;

  this.read_sessions  = {};
  this.write_session  = null;
}

util.inherits(Session, EventEmitter);

function Read_session(sessionId, req, res) {
  this.sessionId = sessionId;
  this.req       = req;
  this.res       = res;
  this.flag      = req.query.flag;

  function on_read_close () {
    this.emit("close", this.sessionId);
  };

  this.req.on("close",   on_read_close.bind(this));
  this.req.on("aborted", on_read_close.bind(this));
}

util.inherits(Read_session, Session);

Read_session.prototype.write = function (chunk) {
  this.res.write(chunk);
};

function Write_session(session, req, res) {
  this.session  = session;
  this.req      = req;
  this.res      = res;
  this.headers  = req.headers;
  this.streamid = req.headers['streamid'];
  this.type     = req.headers['type'];
  this.format   = req.headers['format'];

  this.req.on("data",    this.session.on_write_data.bind(this.session));
  this.req.on("close",   this.session.on_write_close.bind(this));
  this.req.on("aborted", this.session.on_write_close.bind(this));

  this.req.on("end", function () {
    this.res.end();
                       //this.on_write_close();
  }.bind(this));
}

Session.prototype.add_read = function (req, res) {
  var sid      = this.new_session_id();
  var session  = new Read_session(sid, req, res);
  this.read_sessions[sid] = session;

  session.on("close", this.on_read_close.bind(this));

  if (this.write_session) {
    console.log("--- response to read session headers -------");
    /*
    for (var key in this.write_session.headers) {
      res.setHeader(key, this.write_session.headers[key]);
    }
    */
    res.writeHead(200, this.write_session.headers);
  }
};

Session.prototype.add_write = function (req, res) {
  if (this.write_session) {
    delete this.write_session;
    this.write_session = null;
  }
  
  this.write_session = new Write_session(this, req, res);

  for (var rss_id in this.read_sessions) {
    var rss = this.read_sessions[rss_id];
    rss.res.writeHead(200, this.write_session.headers);
  }
};

Session.prototype.on_read_close = function (sessionId) {
  if (this.read_sessions[sessionId]) {
    delete this.read_sessions[sessionId];
  }
};

Session.prototype.on_write_close = function () {
  console.log("---------- on_write_close ----------");
  if (this.write_session) {
    delete this.write_session
    this.write_session = null;
  }
};

Session.prototype.on_write_data = function (chunk) {
  for (var rss_id in this.read_sessions) {
    var rss = this.read_sessions[rss_id];
    if (rss.flag === "1") {
      rss.write(chunk);
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