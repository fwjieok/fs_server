'use strict';
/*jslint vars : true*/

module.exports = function (req, res) {
    var tid = req.query.tid;
    if (!tid) {
        return res.status(400).end("not found fid");
    }

    var sql = "select t.tid, t.taxid, s.streamid, s.chid, s.name, s.type, s.format from stream s " +
              "join timeline t " +
              "on s.taxid = t.taxid where t.tid = $1";

    req.app.server.db.query(sql, [tid], function (err, result) {
        if (err) {
            console.log(err);
            return res.status(500).end();
        }

        var json = {
            tid: null,
            taxid: null,
            channels: []
        };

        for (var i = 0; i < result.rows.length; i ++) {
            var row = result.rows[i];
            json.tid = row.tid;
            json.taxid = row.taxid;
            json.channels.push({
                chid:   row.chid,
                name:   row.name,
                type:   row.type,
                format: row.format
            });
        }

        res.end(JSON.stringify(json));
    });
}


/*

子查询
select chid, streamid, name, type, format from stream where taxid=(select taxid from timeline where tid='COWN-123-45-678')

表连接
select t.tid, t.taxid, s.streamid, s.chid, s.name, s.type, s.format from stream s 
join timeline t 
on s.taxid = t.taxid where t.tid = 'COWN-123-45-678'
*/