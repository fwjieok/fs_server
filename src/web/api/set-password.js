'use strict';
/*jslint vars:true*/
var fs = require('fs');
module.exports = function (req, res) {
    var pass_old = req.query["old"];
    var pass_new = req.query["new"];
    var config_file = req.app.config_file;
    console.log(pass_old, pass_new);

    var config = fs.readFileSync(config_file);
    config = JSON.parse(config);
    var result = {
        result : "OK"
    };
    if (config["web-pass"] !== pass_old) {
        result.result = "密码错误";
    } else {
        config["web-pass"] = pass_new;
        fs.writeFileSync(config_file, JSON.stringify(config, null, 4));
        req.app.log(0, "密码修改",
                    req.socket.remoteAddress,
                    req.socket.remotePort);
    }
    res.end(JSON.stringify(result));
};
