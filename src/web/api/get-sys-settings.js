'use strict';
var http = require('http');
/*jslint vars:true*/

var fields = [
    "storage-number",
    "work-mode",      
    "fsc-host",           
    "fsc-port",            
    "beep-monitor-fsc",
	"beep-monitor-net",    
	"beep-monitor-internet",
    "web-pass",
	"web-port"             
];

function copy_fields(fieldsList, config) {
    var result = {};
    for (var i = 0; i < fieldsList.length; i++) {
        var value = config[fieldsList[i]];
        if (typeof value !== 'undefined') {
            result[fieldsList[i]] = value;
        }
    }
    
    return result;
}

module.exports = function (req, res) {
    var result = copy_fields(fields, req.app.server.config);
    result["system-time"] = "";
    res.send(result);
};
