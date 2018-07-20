'use strict';
/*jslint vars : true*/

var util       = require('util');
var path       = require('path');
var bodyParser = require('body-parser');
var express    = require('express');
var API_man    = require("../common/api-man.js");

function Fsc_server () {
    this.web     = null;
    this.api_man = null;

    this.stream_sessions = {};
}

Fsc_server.prototype.start_web_api = function () {
    this.web     = express();
    this.web.use(bodyParser.json());
    this.web.use(bodyParser.urlencoded({ extended: true }));
    this.web.use(express.static(path.join(__dirname, './public')));

    this.api_man = new API_man(this.web, __dirname + "/api", "/");
    this.api_man.mount();

    this.web.server = this;
    this.web.all("*", function (req, res, next) {
	    next();
    });

    this.web.listen(7000, function () {
        console.log("web listen on 7000");
    });
}

Fsc_server.prototype.start = function () {
    this.start_web_api();
}

module.exports = Fsc_server;
