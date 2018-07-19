'use strict';
var http = require('http');
/*jslint vars:true*/

var fields = [
    "reciver-number",
    "multi-channels-type",
    "panel-event-first",
    "log-online-offline",
    "confirm-offline-time",
    "center-heartbeat-time",
    "allow-control-device",
    "monitor-beep-serial",
    "monitor-beep-tcp",
    "monitor-beep-net",
    "serial-format",
    "serial-baud",
    "report-event-online-offline",
    "report-status-online-offline",
    "tcp-max-connections",
    "bind-connection-ip",
    "allow-connection-ip",
    "tcp-format",
    "tcp-report-event-online-offline",
    "tcp-report-status-online-offline",
    "tcp-allow-control-device",
    "api-key",
    "api-allow-set-time",
    "api-allow-reboot",
    "web-port",
    "tcp-server-port",
    "remote-program-port",
    "remote-program-enabled",
    "remote-control-pwd-save-enabled",
    "white-list-enabled"
];

function copy_fields(fieldsList, config) {
    var result = {};
    for (var i = 0; i < fieldsList.length; i++) {
        var value = config[fieldsList[i]];
        if (typeof value !== 'undefined') {
            result[fieldsList[i]] = value;
        } else {
            if (fieldsList[i] === 'monitor-beep-serial') {
                result[fieldsList[i]] = true;
            } else if (fieldsList[i] === 'monitor-beep-tcp') {
                result[fieldsList[i]] = true;
            } else if (fieldsList[i] === 'monitor-beep-net') {
                result[fieldsList[i]] = true;
            } else if (fieldsList[i] === 'report-event-online-offline') {
                result[fieldsList[i]] = true;
            } else if (fieldsList[i] === 'report-status-online-offline') {
                result[fieldsList[i]] = true;
            } else if (fieldsList[i] === 'tcp-max-connections') {
                result[fieldsList[i]] = 1;
            } else if (fieldsList[i] === 'bind-connection-ip') {
                result[fieldsList[i]] = false;
            } else if (fieldsList[i] === 'allow-connection-ip') {
                result[fieldsList[i]] = '192.168.1.110';
            } else if (fieldsList[i] === 'tcp-format') {
                result[fieldsList[i]] = 'conwin';
            } else if (fieldsList[i] === 'tcp-report-event-online-offline') {
                result[fieldsList[i]] = true;
            } else if (fieldsList[i] === 'tcp-report-status-online-offline') {
                result[fieldsList[i]] = true;
            } else if (fieldsList[i] === 'tcp-allow-control-device') {
                result[fieldsList[i]] = true;
            } else if (fieldsList[i] === 'multi-channels-type') {
                result[fieldsList[i]] = 0;
            } else if (fieldsList[i] === 'tcp-server-port') {
                result[fieldsList[i]] = 1025;
            } else if (fieldsList[i] === 'remote-program-port') {
                result[fieldsList[i]] = 1026;
            } else if (fieldsList[i] === 'remote-program-enabled') {
                result[fieldsList[i]] = false;
            } else if (fieldsList[i] === 'center-heartbeat-time') {
                result[fieldsList[i]] = 60;
            } else if (fieldsList[i] === 'remote-control-pwd-save-enabled') {
                result[fieldsList[i]] = false;
            } else if (fieldsList[i] === 'white-list-enabled') {
                result[fieldsList[i]] = false;
            }
        }
    }
    
    return result;
}

module.exports = function (req, res) {
    var result = copy_fields(fields, req.app.server.config.ipr);
    result["system-time"] = "";
    res.end(JSON.stringify(result));
};
