'use strict';
/*jslint vars:true*/

module.exports = function (req, res) {
    var tid  = req.headers.tid;
    if (!tid) {
      return res.status(403).end();
    }

    console.log(req.body);

    return;
    
    var sql = "select * from fid where hash = $1";
    req.app.server.db.query(sql, [file.hash], function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }
        var hash_found = false;
        var name_found = false;
        var fid_found  = null;
        var rows = result.rows;
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            if (row.hash === file.hash) {
                console.log("hash found");
                hash_found = true;
            }
            if (row.fname === file.fname) {
		console.log("name found");
                name_found = true;
                fid_found  = row.fid;
            }
        }
        if (hash_found && name_found) {
	    console.log("hash_found && name_found");
            return res.json({fid: fid_found, exists: true});
        }
        var sql = "insert into fid (fid, hash, storage, fname, type, size, uploader, t_upload)";
        sql = sql + " values ($1, $2, $3, $4, $5, $6, $7, now())";
        var param = [file.fid, file.hash, tid, file.fname, file.type, file.size, {tid: tid}];
        req.app.server.db.query(sql, param, function (err, result) {
            if (err) {
                console.error(err);
                return res.status(500).end();
            }
	    
            res.json({fid: file.fid, exists: hash_found});
        });
	
        if (!hash_found) {
            var sql = "update storage set size_used = size_used + $1, size_free = size_free - $1 where tid = $2";
            req.app.server.db.query(sql, [file.size, tid], function (err, result) {
                if (err) {
                    console.error(sql, err);
                }
            });
        }
    });
};
