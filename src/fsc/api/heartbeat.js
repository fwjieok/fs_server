'use strict';
/*jslint vars:true*/

module.exports = function (req, res) {
    var tid = req.headers.tid;
    if (!tid) {        
        return res.status(403).end();
    }

    var info = req.query.info;
    try {
        info = JSON.parse(info);
    } catch (e) {
        console.log(e);
        return res.status(400).end();
    }
    
    return res.end();

    //判断该扩展设备是否可用

    //var sql = "select * from fid join storage on fid.storage = storage.tid where fid = $1";
    var sql = "select hash, type, fname, storage, s.protocol, s.hostname, s.port from fid ";
        sql += "join storage s ";
	sql += "on fid.storage = s.tid ";
        sqp += "where fid = $1";

    req.app.server.db.query(sql, [fid], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }
	
        var rows = result.rows;
        if (rows.length === 0) {
            return res.status(404).end();
        }
	
        res.json(rows[0]);
    });
};
