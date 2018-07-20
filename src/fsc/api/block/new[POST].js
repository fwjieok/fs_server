'use strict';
/*jslint vars:true*/

module.exports = function(req, res) {
    var tid = req.headers.tid;
    if (!tid) {
        return res.status(403).end();
    }

    var format = req.headers.format; //picture/audio/video
    if (!format) {
        res.status(400).end("block type is not found");
        return;
    }

    if (format === "picture") {
        var picture = new Picture_block_insert(req, res);
    } else if (format === "video") {

    } else if (format === "audio") {

    }
};

function Picture_block_insert(req, res) {
    var tid = req.headers.tid;
    var block = req.body;

    var sql = "insert into block (bid, storage, streamid, size, frames, sample_rate, t_upload, t_start, t_end, meta) " +
        "values ($1, $2, $3, $4, $5, $6, now(), $7, $8, $9)";
    var params = [block.bid, tid, block.streamid, block.size, block.frames, block.sample_rate, block.t_start, block.t_end, block.meta];

    req.app.server.db.query(sql, params, function(err, result) {
        if (err) {
            console.error(err);
            return res.status(500).end();
        }

        console.log("insert into block ok: ", result.rowCount);
        res.end();

        var sql = "update storage set size_used = size_used + $1, size_free = size_free - $1 where tid = $2";
        req.app.server.db.query(sql, [block.size, tid], function(err, result) {
            if (err) {
                console.error(sql, err);
                return;
            }

            console.log("update storage size ok");
        });

    }.bind(this));
}