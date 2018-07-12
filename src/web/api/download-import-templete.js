'use strict';
/*jslint vars:true*/

var fs   = require('fs');
var path = require('path');

var BOM  = "\uFEFF";

module.exports = function (req, res) {
    var name       = "导入设备模板.csv";
    var filePath   = path.join(process.env.JVAR, name);
    var len        = fs.statSync(filePath).size;    
    res.set('Content-Type',        'application/octet-stream');
    res.set('Content-Length',      len + BOM.length);
    res.set('Content-Disposition', 'attachment; filename=' + name);

    res.write(BOM);
    fs.createReadStream(filePath).on('data', function (data) {
	    res.write(data);
    }).on('end', function () {
	    res.end();
    });
};
