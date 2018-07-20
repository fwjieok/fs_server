'use strict';
/*jslint vars:true, stupid:true*/

var express      = require('express');
var path         = require('path');
var url          = require('url');
var fs           = require('fs');
var favicon      = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var exphbs       = require('express-handlebars');
var hbs_helpers  = require('./handlebar-helpers.js');
var web          = express();

var hbs = exphbs.create({
    partialsDir   : path.join(__dirname, 'views/partials/'),
    layoutsDir    : path.join(__dirname, "views/layouts/"),
    defaultLayout : 'main',
    extname       : '.html',
    helpers       : hbs_helpers
});

web.engine('html', hbs.engine);
web.set('view engine', 'html');
web.set('views', path.join(__dirname, 'views'));

web.use(bodyParser.json()); //for parse application/json
web.use(bodyParser.urlencoded({ extended: true })); //application/x-www-form-urlencoded
web.use(cookieParser());
web.use(favicon(path.join(__dirname, './public/images/logo.jpg')));
web.use(express.static(path.join(__dirname, './public')));

web.sessions = {};
web.SESSION_ALIVE_TIME = 1000 * 60 * 30; //  3 minutes

web.all("*", function (req, res, next) {
    if (req.query.key === req.app.config.sys["api-key"]) {
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
});

var API_man = require("./api-man.js");
var api_man = new API_man(web, __dirname + "/api", "/api/");
api_man.mount();

var no_save_btn     = ['index', 'sys-log', 'event-log'];
var show_export_btn = ['sys-log'];

web.get("/", function(req, res, next) {
    try {
        var config = req.app.config;
        res.render("index", {
            title: req.app.config.cwcdn.MODEL.toUpperCase(),
            show_save_btn: false
        });
    } catch (error) {
        console.log(error);
    }
});

web.get("/:view", function(req, res, next) {
    try {
        var config = req.app.config;
        var view   = req.params.view;
        if (view === "login") {
            return res.render(view, { layout: null });
        }
        res.render(view, {
            title           : req.app.config.cwcdn.MODEL,
            show_save_btn   : no_save_btn.indexOf(view) < 0,
            show_export_btn : show_export_btn.indexOf(view) >= 0
        });
    } catch (error) {
        console.log(error);
    }
});

web.res_with_external_command = function(req, res, command) {
    var exec = require('child_process').exec, child;
    command = "bash -c '" + command + "'";
    child = exec(command, function(error, stdout, stderr) {
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
