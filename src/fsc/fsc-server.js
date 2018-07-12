'use strict';
/*jslint vars : true*/
var util	= require('util');
var express	= require('express');
var API_man	= require("../common/api-man.js");
var Db          = require("../db-pg.js");
var file_proxy	= require("./file-proxy.js");

function Fsc_server () {
    this.web     = null;
    this.api_man = null;
    this.db      = null;
}

Fsc_server.prototype.start = function () {
    this.db      = new Db();
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

    this.web.all("/open", function (req, res, next) {
	//res.end("stream api: " + req.path);
	file_proxy(req, res);
    });


    this.web.all("/stream/write", function (req, res, next) {
	//res.end("stream api: " + req.path);
	file_proxy(req, res);
    });

    this.web.listen(7000, function () {
	console.log("web listen on 7000");
    });

}

var fsc = new Fsc_server();
fsc.start();


