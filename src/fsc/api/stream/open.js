'use strict';
/*jslint vars : true*/

var sql_check_taxid = "select taxid from timeline where tid = $1";
var sql_create_timeaxis = "insert into timeline (taxid, tid, description, t_created, t_moditied) values ($1, $2, $3, now(), now()) ";

var sql_check_chid_sid = "select chid, streamid from stream where taxid = $1 and chid in"

var flags = ["O_CREAT", "O_RDONLY", "O_RDWR"];

module.exports = function (req, res) {

    console.log("---------- stream open -------");
    console.log(req.query);

    var stream = {
        "tid": "COWN-1K1-KU-791",
        "channels": [{ "chid": "ch-v1", "streamid": "wUnaQfBXQ+2jVwhHBnhJkQ" }],
        "taxid": "KUW9gi5vQAmNBYQX-5AWog"
    };

    var flag = req.query.flag;
    var data = req.query.data;

    if (flags.indexOf(flag) < 0) {
        return res.status(400).end("flag not valid");
    }

    try {
        data = JSON.parse(data);
    } catch (e) {
        return res.status(400).end("data not valid");
    }
    
    var tid   = data.tid;
    var taxid = null;
    var db    = req.app.server.db;

    (async () => function () {
        var sql    = "select taxid from timeline where tid = $1";
        var result = await db.query(sql_check_taxid, [tid]);
        if (result.rows.length == 0) {
            sql = "insert into timeline (taxid, tid, description, t_created, t_moditied) values ($1, $2, $3, now(), now()) returning taxid";
            result = await db.query(sql_check_taxid, [uuid.create(), tid, "警云设备"]);
            taxid  = result.rows[0].taxid;
        } else {
            taxid = result.rows[0].taxid;
        }

        console.log("------- taxid: ", taxid);

    })();

    res.end(JSON.stringify(stream));
}

/*
    查询时间轴
    if 不存在
        创建时间轴
    else 
        遍历查询通道流ID
            if 不存在
                创建
            else
                读取

    return 通道流ID

*/