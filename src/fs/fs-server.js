'use strict';
/*jslint vars : true*/

var util = require('util');
var path = require('path');
var express = require('express');
var bodyParser   = require('body-parser');
var API_man = require("../common/api-man.js");

function Fs_server() {
    this.web = null;

    this.stream_sessions = {};
    this.protocol = "http";
}

Fs_server.prototype.start = function() {
    this.web = express();

    var api_man = new API_man(this.web, __dirname + "/api", "/");
    api_man.mount();

    this.web.use(bodyParser.json());
    this.web.use(bodyParser.urlencoded({ extended: false }));
    this.web.use(express.static(path.join(__dirname, './public')));
    this.web.server = this;
    this.web.all("*", function(req, res, next) {
        next();
    });

    this.web.all("/", function(req, res, next) {
        res.sendFile(__dirname + "/test/upload.html");
    });

    this.web.listen(7001, function() {
        console.log("fs server listen on 7001");
    });
};

module.exports = Fs_server;