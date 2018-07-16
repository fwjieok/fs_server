'use strict';
/*jslint vars:true*/

var util = require("util");

function password_modify_to_panel(session, params) {
    var param = util.format("%s,%s,%s,%s", params.user, params.auth, params.pass_new, params.pass);
    session.send_cmd(params.acct, '17', param);
}

function panel_open(session, params) {
    var param = util.format("%s,,%s", params.area, params.pass);
    console.log(param);
    session.send_cmd(params.acct, '2', param);
}

function panel_away(session, params) {
    var param = util.format("%s,,%s", params.area, params.pass);
    console.log(param);
    session.send_cmd(params.acct, '1', param);
}

function panel_stay(session, params) {
    var param = util.format("%s,,%s", params.area, params.pass);
    session.send_cmd(params.acct, '6', param);
}

function zone_bypass(session, params) {
    var param = util.format(",%s,%s", params.zone, params.pass);
    session.send_cmd(params.acct, '3', param);
}

function zone_unbypass(session, params) {
    var param = util.format(",%s,%s", params.zone, params.pass);
    session.send_cmd(params.acct, '5', param);
}
 
function po_open(session, params) {
    //console.log("method: po_open", params);
    var param = util.format("%s,%s,%s", "1", params.po, params.delay);
    session.send_cmd(params.acct, '18', param);
}

function po_close(session, params) {
    //console.log("method: po_close", params);
    var param = util.format("%s,%s,%s", "0", params.po, params.delay);
    session.send_cmd(params.acct, '18', param);
}

var methods = {
    "password-modify-to-panel" : password_modify_to_panel,
    "panel-open"               : panel_open,
    "panel-away"               : panel_away,
    "panel-stay"               : panel_stay,
    "zone-bypass"              : zone_bypass,
    "zone-unbypass"            : zone_unbypass,
    "po-open"                  : po_open,
    "po-close"                 : po_close
};

module.exports = function (req, res) {
    var method = req.query.method;
    var params = req.query.params;

    try {
        params = JSON.parse(params);
    } catch (e) {
        res.send({code: "-1", msg: "参数错误"});
        return;
    }
    var server  = req.app.server;
    var session = req.app.server.get_session(params.tid);
    if (session) {
        if (method === "password-local-save") {
            if (server.acct_pass[params.acct] !== params.pass) {
                server.acct_pass[params.acct] = params.pass;
                server.save_acct_password();
            }
            res.send({code: "0", msg: "保存成功"});
        } else {
            if (methods[method]) {
                methods[method](session, params);
                res.send({code: "0", msg: "命令发送成功"});
            } else {
                res.send({code: "-1", msg: "该功能不支持"});
            }
        }
    } else {
        res.send({code: "-1", msg: "系统错误，找不到用户"});
    }
};
