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

function valid_format(format) {
    if (['conwin', '685'].indexOf(format) < 0) { return false; }
    return true;
}

var valid_field = {};

valid_field["reciver-number"] = function (value) {
    if (typeof value !== 'number') { return false; }
    if (value < 0 || value > 9) { return false; }
    return true;
};

valid_field["multi-channels-type"]    = function (value) {
    var types = [0, 1, 2];
    if (types.indexOf(value) < 0) { return false; }
    return true;
};

valid_field["serial-baud"]    = function (value) {
    var bauds = [1200, 2400, 4800, 9600, 19200, 38400, 57600, 115200];
    if (bauds.indexOf(value) < 0) { return false; }
    return true;
};

valid_field["serial-format"]                    = valid_format;
valid_field["report-event-online-offline"]      = valid_boolean;
valid_field["report-status-online-offline"]     = valid_boolean;
valid_field["allow-control-device"]             = valid_boolean;

valid_field["tcp-max-connections"] = function (value) {
    if (typeof value !== 'number') { return false; }
    if (value < 1 || value > 100) { return false; }
    return true;
};
valid_field["allow-connection-ip"] = function (ipStr) {
    if (typeof ipStr !== 'string') { return false; }
    var regexp = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/;
    if (regexp.test(ipStr)) {
        if (RegExp.$1 < 256 && RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256) {
            return true;
        }
    }
    return false;
};

valid_field["tcp-format"]                       = valid_format;
valid_field["bind-connection-ip"]               = valid_boolean;
valid_field["tcp-report-event-online-offline"]  = valid_boolean;
valid_field["tcp-report-status-online-offline"] = valid_boolean;
valid_field["tcp-allow-control-device"]         = valid_boolean;

valid_field["panel-event-first"]                = valid_boolean;
valid_field["log-online-offline"]               = valid_boolean;

valid_field["monitor-beep-serial"]              = valid_boolean;
valid_field["monitor-beep-tcp"]                 = valid_boolean;
valid_field["monitor-beep-net"]                 = valid_boolean;
valid_field["remote-program-enabled"]           = valid_boolean;
valid_field["remote-control-pwd-save-enabled"]  = valid_boolean;
valid_field["white-list-enabled"]               = valid_boolean;

valid_field["confirm-offline-time"]  = function (value) {
    if (typeof value !== 'number') { return false; }
    if (value < 0 || value > 1200) { return false; }
    return true;
};

valid_field["center-heartbeat-time"]  = function (value) {
    if (typeof value !== 'number') { return false; }
    if (value < 0) { return false; }
    return true;
};

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

valid_field["remote-program-port"] = function (value) {
    if (typeof value !== 'number') { return false; }
    if (value < 1000 || value > 65535) { return false; }
    return true;
};

valid_field["tcp-server-port"] = function (value) {
    if (typeof value !== 'number') { return false; }
    if (value < 1000 || value > 65535) { return false; }
    return true;
};

function log(req, msg) {
    req.app.server.log(0, "admin",
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
            req.app.server.log(0, "admin",
                               req.socket.remoteAddress,
                               req.socket.remotePort, "重置系统时间失败:", time, stderr);
            console.log('exec error: ' + error);
        } else {
            req.app.server.log(0, "admin",
                               req.socket.remoteAddress,
                               req.socket.remotePort, "重置系统时间成功:" + time);
        }
    });
}

function set_monitor_beep(beep_type, enabled, req) {
    var env  = process.env;
    var file = env.JFLAGS + "/monitor-beep-" + beep_type;
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
    "multi-channels-type",
    "serial-baud",
    "bind-connection-ip",
    "allow-connection-ip",
    "web-port",
    "tcp-server-port",
    "remote-program-port"
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
    var config_file = req.app.server.config_file;
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

		        if (key === "monitor-beep-net") {
		            set_monitor_beep("net", value, req);
                    loged = true;
		        }
		        if (key === "monitor-beep-serial") {
		            set_monitor_beep("serial", value, req);
                    loged = true;
		        }
                if (key === "monitor-beep-tcp") {
		            set_monitor_beep("tcp", value, req);
                    loged = true;
		        }
                if (key === "white-list-enabled") {
                    if (value === true) {
                        log(req, "启用连接白名单");
                    } else {
                        log(req, "禁用连接白名单");
                    }
                    loged = true;
                }
            } else {
                console.log("[/api/set-ipr.js] error: ", key, value);
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
        log(req, "接警机参数修改");
    }

    if (need_reboot) {
        process.exit(1);
    }
};
