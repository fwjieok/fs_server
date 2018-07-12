'use strict';
/*jslint vars:true, stupid:true*/

var express      = require('express');
var path         = require('path');
var url          = require('url');
var fs           = require('fs');
var favicon      = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var partials     = require('./partials');

var web          = express();
web.sessions = {};
web.SESSION_ALIVE_TIME = 1000 * 60 * 30; //  3 minutes

web.set('views', path.join(__dirname, './views'));
web.set('view engine', 'hjs');

web.use(bodyParser.json());
web.use(bodyParser.urlencoded({ extended: false }));
web.use(cookieParser());
web.use(express.static(path.join(__dirname, './public')));

web.all("*", function (req, res, next) {
    var pathname = url.parse(req.url).pathname;
    if (pathname === "/favicon.ico") {
        res.end();
        return;
    }

    next();
    /*
    if (req.query.key === req.app.server.config.ipr["api-key"]) {
        next();
    } else if (req.query.sid) {
        next();
    } else {
        if (web.sessions[req.cookies.sid]) {
            next();
        } else {
            if (["/login", "/api/do-login"].indexOf(req.path) >= 0) {
                next();
            } else {
                res.redirect("/login");
            }
        }
    }
    */
});

var API_man = require("./api-man.js");
var api_man = new API_man(web, __dirname + "/api", "/api/");
api_man.mount();
var no_save_btn     = ['sys-log', 'index', 'event-log', 'session-log',
                       'set-update-ver', 'set-white-list'];
var show_export_btn = ['sys-log', 'event-log', 'session-log'];
web.get("/", function (req, res, next) {
    try {
        //var config = req.app.server.config;
        res.render("index", {
            // title            : req.app.server.config.cwcdn.MODEL,
            title            : "CN8040",
            partials         : partials,
            show_save_btn    : false
        });
    } catch (error) {
        console.log(error);
    }
});

web.get("/*.html", function (req, res, next) {
    var pathname = url.parse(req.url).pathname;
    pathname = path.join(__dirname, './views', pathname);
    if (fs.existsSync(pathname)) {
        res.sendFile(pathname);
    } else {
        res.status(404).end(req.pah + " not found!");
    }
});
        
web.get("/:view", function (req, res, next) {
    try {
        //var config = req.app.server.config;
        var view   = req.params.view;
        res.render(view, {
            // title            : req.app.server.config.cwcdn.MODEL,
            title            : "CN8040",
            partials         : partials,
            show_save_btn    : no_save_btn.indexOf(view) < 0,
            show_export_btn  : show_export_btn.indexOf(view) >= 0,
        });
    } catch (error) {
        console.log(error);
    }
});

web.res_with_external_command = function (req, res, command) {

    var exec = require('child_process').exec, child;
    command = "bash -c '" + command + "'";
    child = exec(command, function (error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
            console.log('exec error: ' + error);
            res.status(500).end();
        } else {
	        var result;
	        try {
		        result = JSON.parse(stdout);
	        } catch (e) {
                console.log(e);
		        result = {};
	        }
            res.end(JSON.stringify(result));
        }
    });
};

module.exports = web;
