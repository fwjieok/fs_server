'use strict';
/*jslint vars:true*/

module.exports = function(req, res) {
    var tid = req.headers.tid;
    if (!tid) {
        res.status(403).end();
        return;
    }
    
    var format = req.headers.format; //picture/audio/video
    if (!format) {
        res.status(400).end("block type is not found");
        return;
    }

    if (format === "picture") {
        var picture = new Picture_block_query(req, res);
    } else if (format === "video") {

    } else if (format === "audio") {

    }
};

function Picture_block_query(req, res) {
    this.req = req;
    this.res = res;

    var streamid = req.query.streamid;
    var from	 = req.query.from;
    var to	 = req.query.to;

    var sql = "select b.storage, s.protocol, s.hostname, s.port, b.bid, b.frames, b.sample_rate, b.t_start, b.t_end, b.meta " +
        "from block b " +
        "join storage s on b.storage = s.tid  " +
        "where streamid = $1 AND t_start >= $2 AND t_start <= $3 ORDER BY t_start ASC LIMIT 240 OFFSET 0";
    var params = [streamid, parseInt(from), parseInt(to)];

    //console.log(sql);
    //console.log(params);

    req.app.server.db.query(sql, params, function(err, result) {
        if (err) {
            console.error(err);
            return this.res.status(500).end();
        }

        var rows = result.rows;
        if (rows.length === 0) {
            return this.res.status(404).end();
        }

        this.res.send(rows);
    }.bind(this));
}

/*
    select s.tid, s.protocol, s.hostname, s.port, b.bid, b.frames, b.sample_rate, b.t_start, b.t_end, b.meta 
    from block b
    join storage s on b.storage = s.tid  
    where streamid='4QV9oehdQI6z2+izBfUmPg' AND t_start > 1532004487816  AND t_start < 1532004489076 ORDER BY t_start ASC LIMIT 1000 OFFSET 0

    from = '1531991530186'
    
    select s.protocol, s.hostname, s.port, b.bid, b.frames, b.sample_rate, b.t_start, b.t_end, b.meta 
    from block b
    join storage s on b.storage = s.tid 
    where streamid='4QV9oehdQI6z2+izBfUmPg' AND t_start >= '1531995418776' ORDER BY t_start ASC LIMIT 1000 OFFSET 0';

*/
