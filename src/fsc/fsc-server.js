'use strict';
/*jslint vars : true*/
var util	= require('util');
var express	= require('express');
var API_man	= require("../common/api-man.js");
var Db              = require("../common/db-pg.js");
var file_proxy	    = require("./file-proxy.js");
var Stream_session	= require("./stream-session.js");

function Fsc_server () {
  this.web     = null;
  this.api_man = null;
  this.db      = null;

  this.stream_sessions = {};
}

Fsc_server.prototype.on_stream_write = function (req, res) {
  var streamid = req.headers["streamid"];
  if (!streamid) {
    return res.status(404).end();
  }

  var session  = this.stream_sessions[streamid];
  if (!session) {
    session = new Stream_session(this);
    this.stream_sessions[streamid] = session;
  }

  console.log("------ on_stream_write: ", streamid);
  session.add_write(req, res);
};

Fsc_server.prototype.on_stream_read = function (req, res) {
  var streamid = req.query.streamid;
  if (!streamid) {
    return res.status(404).end();
  }

  var session  = this.stream_sessions[streamid];
  if (!session) {
    session = new Stream_session(this);
    this.stream_sessions[streamid] = session;
  }
  console.log("------ on_stream_read: ", streamid);
  session.add_read(req, res);
};

Fsc_server.prototype.on_stream_open = function (req, res) {
  console.log("---------- stream open -------");
  console.log(req.query);

  var stream = { "tid": "COWN-1K1-KU-791",
		         "channels": [{"chid": "ch-v1", "streamid": "wUnaQfBXQ+2jVwhHBnhJkQ"}],
		         "taxid":"KUW9gi5vQAmNBYQX-5AWog"};
  
  res.end(JSON.stringify(stream));
};

Fsc_server.prototype.start_web_api = function () {
    this.web     = express();
    this.api_man = new API_man(this.web, __dirname + "/api", "/api/");
    this.api_man.mount();

    this.web.server = this;
    this.web.all("*", function (req, res, next) {
	next();
    });

    this.web.all("/", function (req, res, next) {
	res.sendFile(__dirname + "/index.html");
    });

    this.web.all("/file/:method", function (req, res, next) {
	  console.log("file api: ", req.params.method);
	  file_proxy(req, res);
    });

    this.web.all("/realstream/:method", function (req, res, next) {
	  res.end("stream api: " + req.path);
    });
    
  this.web.all("/backstream/:method", function (req, res, next) {
	  //res.end("stream api: " + req.path);
	file_proxy(req, res);
  });

  this.web.all("/open",               this.on_stream_open.bind(this));
  this.web.all("/stream/write",       this.on_stream_write.bind(this));
  this.web.all("/stream/read",        this.on_stream_read.bind(this));
//  this.web.all("/stream/write_back",  this.on_stream_write_back.bind(this));

  this.web.listen(7000, function () {
    console.log("web listen on 7000");
  });

}

Fsc_server.prototype.start = function () {
  this.db      = new Db();

  this.start_web_api();
}

var fsc = new Fsc_server();
fsc.start();
