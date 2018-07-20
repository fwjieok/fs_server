'use strict';
/*jslint vars:true*/
var fs  = require('fs');
var env = process.env;

function valid_boolean(value) {
    if (typeof value === "boolean") { return true; }
    if (value === 'true') { return true; }
    if (value === 'false') { return true; }
    return false;
}

var valid_field = {};

valid_field["storage-number"] = function (value) {
    if (typeof value !== 'number') { return false; }
    return true;
};

valid_field["work-mode"]    = function (value) {
    var types = ["fsc-fs", "fs"];
    if (types.indexOf(value) < 0) { return false; }
    return true;
};

valid_field["fsc-host"] = function (ipStr) {
    if (typeof ipStr !== 'string') { return false; }
    var regexp = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
    if (regexp.test(ipStr)) {
        if (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256) {
            return true;
        }
    }
    return false;
};

valid_field["beep-monitor-net"]       = valid_boolean;
valid_field["beep-monitor-internet"]  = valid_boolean;
valid_field["beep-monitor-fsc"]       = valid_boolean;

valid_field["api-key"]               = function (value) {
    if (typeof value !== 'string') { return false; }
    if (value.length > 20) { return false; }
    return true;
};

valid_field["api-allow-set-time"]    = valid_boolean;
valid_field["api-allow-reboot"]      = valid_boolean;

valid_field["web-port"] = function (value) {
    if (typeof value !== 'number') { return false; }
    if (value < 2000 || value > 10000) { return false; }
    return true;
};

function log(req, msg) {
    req.app.log(0, "admin",
                req.socket.remoteAddress,
                req.socket.remotePort,
                msg);
}

function set_system_time(time, req) {
    var exec = require('child_process').exec, child;
    var cmd = 'date -s "' + time + '"';
    child = exec(cmd, function (error, stdout, stderr) {
        // console.log('stdout: ' + stdout);
        // console.log('stderr: ' + stderr);
        if (error !== null) {
            req.app.log(0, "admin",
                        req.socket.remoteAddress,
                        req.socket.remotePort, "重置系统时间失败:", time, stderr);
            console.log('exec error: ' + error);
        } else {
            req.app.log(0, "admin",
                        req.socket.remoteAddress,
                        req.socket.remotePort, "重置系统时间成功:" + time);
        }
    });
}

function set_beep_monitor(monitor, enabled, req) {
    var env  = process.env;
    var file = env.JFLAGS + "/monitor-beep-" + monitor;
    var info = "";
    if (enabled) {
	    if (!fs.existsSync(file)) {
	        fs.openSync(file, "w");
            info = "启用蜂鸣器监控";
            log(req, info);
            console.log(info);
	        return true;
	    }
    } else {
	    if (fs.existsSync(file)) {
	        fs.unlinkSync(file);
            info = "禁用蜂鸣器监控";
            log(req, info);
            console.log(info);
	        return true;
	    }
    }
}

var fields_need_reboot = [
    "work-mode",
    "fsc-host",
    "web-port"
];

module.exports = function (req, res) {
    var config = req.query.data;
    if (!config) {
        res.status(400).end();
        return;
    }
    var config_new;
    try {
        config_new = JSON.parse(config);
    } catch (error) {
        res.status(400).end();
        return;
    }
    console.log(config_new);
    var config_file = req.app.config_file;
    var config_old  = fs.readFileSync(config_file);
    config_old = JSON.parse(config_old);
    var loged  = false;
    var fail   = false;
    var reason = "";
    var need_reboot = false;
    var new_time = config_new["system-time"];
    if (new_time) {
        set_system_time(new_time, req);
    }
    for (var key in config_new) {
        if (!config_new.hasOwnProperty(key)) { continue; };
        if (config_new[key] === config_old[key]) { continue; };
        if (key === "system-time") { continue; };
        if (fields_need_reboot.indexOf(key) >= 0) {
            need_reboot = true;
        }
        var value = config_new[key];
        var func  = valid_field[key];

        if (func) {
            if (func(value)) {
                if (typeof config_old[key] === 'boolean') {
                    if (value === 'true') { value = true; }
                    if (value === 'false') { value = false; }
                } 
                config_old[key] = value;

		        if (key === "beep-monitor-net") {
		            set_beep_monitor("net", value, req);
                    loged = true;
		        }
		        if (key === "beep-monitor-internet") {
		            set_beep_monitor("internet", value, req);
                    loged = true;
		        }
                if (key === "monitor-beep-fsc") {
                    set_beep_monitor("fsc", value, req);
                    loged = true;
		        }
            } else {
                console.log("[/api/set-sys.js] error: ", key, value);
                fail = true;
                reason = key;
                break;
            }
        }
    }
    
    if (fail) { res.status(400).end(reason); return; }
    fs.writeFileSync(config_file, JSON.stringify(config_old, null, 4));

    var result = { result: "OK" };
    res.end(JSON.stringify(result));

    if (!loged) {
        log(req, "系统参数修改");
    }

    if (need_reboot) {
        process.exit(1);
    }
};
