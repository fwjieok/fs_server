'use strict';
/*jslint vars:true*/

/*
  该接口由web页面请求显示用
*/

module.exports = function(req, res) {
    var tid = req.headers.tid;
    if (!tid) {
        return res.status(403).end();
    }

    var format = req.query.format; //picture/audio/video
    if (!format) {
        return res.status(400).end("block type is not found");
    }

    var page  = req.query.page;
    var limit = req.query.limit;
    if (page)  { page  = parseInt(page);  }
    if (limit) { limit = parseInt(limit); }

    var sql = "";
    if (format === "file") {

    } else if (format === "picture") {
	sql = "select b.bid, b.size, b.frames, b.sample_rate, b.t_start, b.t_end, b.meta " +
        "from block b " +
        "join stream s on s.streamid = b.streamid " +
        "where s.type = 'picture' ORDER BY t_start ASC LIMIT $1 OFFSET $2";
    } else if (format === "video") {

    } else if (format === "audio") {
	
    }

    var params = [limit, (page - 1)*limit];
    req.app.server.db.query(sql, params, function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }

        var rows = result.rows;
        if (rows.length === 0) {
            return res.status(404).end();
        }

	var result = {
	    "code"  : 0,
	    "msg"   : "",
	    "count" : rows.length,
	    "data"  : rows
	};

	res.send(result);
    });

};
