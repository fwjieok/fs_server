'use strict';
/*jslint vars : true*/

var util       = require('util');
var path       = require('path');
var express    = require('express');
var API_man    = require("../common/api-man.js");
var Db         = require("../common/db-pg.js");
var file_proxy = require("./file-proxy.js");

function Fsc_server () {
  this.web     = null;
  this.api_man = null;
  this.db      = null;

  this.stream_sessions = {};
}

Fsc_server.prototype.start_web_api = function () {
    this.web     = express();
    this.web.use(express.static(path.join(__dirname, './public')));

    this.api_man = new API_man(this.web, __dirname + "/api", "/");
    this.api_man.mount();

    this.web.server = this;
    this.web.all("*", function (req, res, next) {
	     next();
    });

    this.web.all("/", function (req, res, next) {
	     res.sendFile(__dirname + "/test/upload.html");
    });

    this.web.all("/file/:method", function (req, res, next) {
	     console.log("file api: ", req.params.method);
	     file_proxy(req, res);
    });

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
