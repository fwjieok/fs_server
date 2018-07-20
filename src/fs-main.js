'use strict';
/*jslint vars : true*/

var fs         = require('fs');
var path       = require('path');
var env        = process.env;
var Db         = require("./common/db-pg.js");
var Log        = require("./common/log.js");
var Fsc_server = require("./fsc/fsc-server.js");
var Fs_server  = require("./fs/fs-server.js");
var web        = require("./web/fs-web.js");

var envs = ['JSYS', 'APP_HOME', 'cwcdn_conf', 'JRAM', 'JVAR'];

var missed = [];
for (var i = 0; i < envs.length; i++) {
    if (!env[envs[i]]) { missed.push(envs[i]); };
}
if (missed.length > 0) {
    console.log("Env var missed:", missed.join(","));
    process.exit(3);
}

var config_file = env.JSYS + "/etc/config.json";
var config_file_default = env.APP_HOME + "/etc/config.default.json";

var config = {
    cwcdn: {},
    sys: {},
    database: {},
    modules: []
};

process.on('uncaughtException', function () {
    console.log(`Caught exception: ${err}`);
    console.log(err.stack);
    process.exit(-2);
});

process.on("exit", function() {
    process.kill(process.pid);
});

function critical_error() {
    process.exit(-1);
}

function load_config() {
    var cwcdn;
    try {
        cwcdn = fs.readFileSync(env["cwcdn_conf"]).toString();
    } catch (error) {
        console.log("Missing cwcdn.conf");
        return false;
    }
    var list = cwcdn.split("\n");
    for (var i = 0; i < list.length; i++) {
        var f = list[i].split("=");
        var name = f[0];
        if (!name) { continue; };
        f.shift();
        var value = f.join("=");
        if (value.length >= 2 &&
            value[0] === '"' &&
            value[value.length - 1] === '"') {
            value = value.substring(1, value.length - 2);
        }
        config.cwcdn[name] = value;
    }

    var flags = fs.readdirSync(env.JFLAGS);
    console.log("flags = ", flags);
    config.modules = [];
    for (var i = 0; i < flags.length; i++) {
        var name = flags[i].split("_");
        if (name.length < 3 || name[0] !== "module") { continue; };
        var model_name = name[2].toUpperCase();
        config.modules.push(model_name);
    }

    try {
        var ipr = fs.readFileSync(config_file);
        config.ipr = JSON.parse(ipr);
        return true;
    } catch (error) {
        console.log("Missing config file:", config_file);
        console.log(error);
    }

    try {
        var ipr = fs.readFileSync(config_file_default);
        config.ipr = JSON.parse(ipr);
        fs.writeFileSync(config_file, JSON.stringify(config.ipr, null, 4));
    } catch (error) {
        console.log("Can not restore config file to default");
        console.log(error);
    }

    return false;
};

if (!load_config()) {
    critical_error();
}

if (!load_cert_files()) {
    critical_error();
}

console.log("config = ", config);

fs.watch(config_file, function(event, file) {
    load_config();
});

var db = new Db(config.database);
db.init();

var fsc = new Fsc_server(config);
fsc.log = log.bind(fsc);
fsc.start();

var fs = new Fs_server(config);
fs.log = log.bind(this);
fs.start();

web.config = config;
web.log    = log.bind(web);

web.listen(config.sys['web-port'], function() {
    console.log("web listen on 8000");
});

var net_monitor = new Network_monitor(web);
net_monitor.start();
