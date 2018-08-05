'use strict';
/*jslint vars : true*/

var fs = require('fs');
var util = require('util');
var path = require('path');
var express = require('express');
var bodyParser = require('body-parser');
var API_man = require("../common/api-man.js");

var data_root = process.env.HOME + "/.fs/root";

function Fs_server(config) {
    this.config = config;
    this.web = null;

    this.stream_sessions = {};

    this.data_root = data_root;
    this.tid = this.config.modules["CN0842"];

    this.work_mode = "fsc-fs";
    this.protocol = "http";
    this.fsc_host = "127.0.0.1";
    this.fsc_port = 7000;
}

Fs_server.prototype.check_stream_session_idle = function() {
    for (var streamid in this.stream_sessions) {
        var session = this.stream_sessions[streamid];

        var rss_count = 0;
        for (var rssid in session.read_sessions) {
            rss_count++;
        }
        //该session读端或写端还存在
        if (rss_count > 0 || session.write_session) {
            continue;
        }

        delete this.stream_sessions[streamid];
    }
}

Fs_server.prototype.api_start = function() {
    this.web = express();

    var api_man = new API_man(this.web, __dirname + "/api", "/");
    api_man.mount();

    this.web.use(bodyParser.json()); //for parse application/json
    this.web.use(bodyParser.urlencoded({ extended: true }));
    this.web.use(express.static(path.join(__dirname, './public')));
    this.web.server = this;
    this.web.all("*", function(req, res, next) {
        next();
    });

    this.web.all("/", function(req, res, next) {
        res.sendFile(__dirname + "/test/upload.html");
    });

    this.web.listen(7001, function() {
        console.log("fs  listen on 7001");
    });
}

Fs_server.prototype.init_data_root = function() {
    var execSync = require("child_process").execSync;
    var flag = fs.constants.F_OK | fs.constants.R_OK | fs.constants.W_OK;
    try {
        fs.accessSync(this.data_root, flag);
        console.log("data root dir ok, dir:", this.data_root);
        return true;
    } catch (err) {
        var cmd = "mkdir -p " + this.data_root;
        execSync(cmd, function(err, stdout, stderr) {
            if (err) {
                console.log("mkdir data root error, error:", err);
                return false;
            }
            console.log("mkdir data root ok, dir:", this.data_root);

            return true;
        });
    }
}

Fs_server.prototype.start = function() {
    this.init_data_root();

    this.work_mode = this.config.sys["work-mode"];
    //存储扩展模式时需要设置fsc
    if (this.work_mode === "fs") {
        this.fsc_host = this.config.sys["fsc-host"];
        this.fsc_port = this.config.sys["fsc-port"];
    }

    this.api_start();

    setInterval(this.check_stream_session_idle.bind(this), 5000);
};

module.exports = Fs_server;
