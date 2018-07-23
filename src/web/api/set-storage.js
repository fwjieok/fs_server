'use strict';
/*jslint vars:true*/
var fs = require('fs');

function invalid_line_settings(config) {
    var lines = config["tcp-lines"];
    if (!lines) { return "找不到线路设置"; }

    var ports = [];
    for (var key in lines) {
        if (!lines.hasOwnProperty(key)) { continue; }
        var line = lines[key];
        try {
            var n = parseInt(key, 10);
            if (n < 1 || n > 9) { return "线路号超出允许的范围"; }
        } catch (error) {
            return "非法线路号";
        }
        if (line.port < 2000 || line.port >= 10000) {
            return "端口超出允许的范围";
        }
        if (line.prefix && !/^[0-9]{4}$/.test(line.prefix)) {
            return "用户号前缀格式错误:" + prefix;
        }
        ports.push(line.port);
        if (["ipr-1", "ipr-2"].indexOf(line.protocol) < 0) {
            return "不支持的协议类型";
        }
    }
    ports.sort();
    for (var i = 0; i < ports.length - 1; i++) {
        if (ports[i] === ports[i + 1]) {
            return "协议端口重复";
        }
    }
    return "";
}

function config_changed(conf_new, conf_old) {
    for (var key in conf_old) {
        if (!conf_old.hasOwnProperty(key)) { continue; }
        if (conf_new[key] !== conf_old[key]) { return true; }
    }
    return false;
}

module.exports = function(req, res) {
    var data = req.query.data;
    if (!data) {
        res.status(400).end();
        return;
    }
    try {
        data = JSON.parse(data);
    } catch (error) {
        res.status(400).end();
        return;
    }

    (async() => {
        for (var key in data) {
            var info = data[key];
            info.tid = key;

            var res = await req.app.db.add_storage(info);
            console.log("111111", key, res);
        };

        console.log("2222");

        res.end('{result: "OK"}');


    })();

    req.app.log(0, "admin",
        req.socket.remoteAddress,
        req.socket.remotePort, "存储参数修改");
};