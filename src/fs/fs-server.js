'use strict';
/*jslint vars : true*/

var util    = require('util');
var express = require('express');
var API_man = require("../common/api-man.js");

function Fs_server () {
    this.web      = null;
    this.api_man  = null;
    this.db       = null;

    this.protocol = "http";
}

Fs_server.prototype.start = function () {
    this.web     = express();
    this.api_man = new API_man(this.web, __dirname + "/api", "/");
    this.api_man.mount();

    this.web.server = this;
    this.web.all("*", function (req, res, next) {
	next();
    });

    this.web.all("/", function (req, res, next) {
	res.sendFile(__dirname + "/index.html");
    });

    this.web.all("/open", function (req, res, next) {
	console.log("---------- stream open -------");
	console.log(req.query);

	var stream = { "tid": "COWN-1K1-KU-791",
		       "channels": [{"chid": "ch-v1", "streamid": "wUnaQfBXQ+2jVwhHBnhJkQ"}],
		       "taxid":"KUW9gi5vQAmNBYQX-5AWog"};
	
	res.end(JSON.stringify(stream));
    });

    this.web.all("/stream/write", function (req, res, next) {
	console.log(req.path);
	console.log(req.headers);

	console.log("------------- device push realstream -----------");
	
	req.on('data', function (chunk) {
	    //console.log("--------: ", chunk.length);
	});

	req.on('end', function () {
	    console.log("------------- push end -----------------");
	    res.end();
	});

	req.on('close', function () {
	    console.log("------------- push close ----------------");
	});

    });

    this.web.listen(7001, function () {
	console.log("fs server listen on 7001");
    });
};

var fs = new Fs_server();
fs.start();
