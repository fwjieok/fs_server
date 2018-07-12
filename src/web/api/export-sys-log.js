'use strict';
/*jslint vars:true, stupid:true*/

var fs = require('fs');

module.exports = function (req, res) {
    var log_file   = req.app.server.SYS_LOG;
    var len        = fs.statSync(log_file).size;
    var filename   = process.env.TID + '-' + (new Date()).format() + '.csv';
    var readStream = fs.createReadStream(log_file);

    //UTF-8编码的文件头标识，手动写入解决excel打开csv文件乱码
    var BOM = "\uFEFF";
    
    res.set('Content-Type',        'application/octet-stream;charset=utf-8');
    res.set('Content-Length',       len + Buffer.byteLength(BOM));
    res.set('Content-Disposition', 'attachment; filename=' + filename);

    res.write(BOM);
    
    readStream.on('data', function (data) {
        data = data.toString().replace(/;/g, ',');
	    res.write(data);
    });

    readStream.on('end', function () {
	    res.end();
    });
};
