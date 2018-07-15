'use strict';
/*jslint vars : true*/

var flags = ["O_CREAT", "O_RDONLY", "O_RDWR"];

module.exports = function (req, res) {

    console.log("---------- stream open -------");
    console.log(req.query);

    var stream = {
        "tid": "COWN-1K1-KU-791",
        "channels": [{ "chid": "ch-v1", "streamid": "wUnaQfBXQ+2jVwhHBnhJkQ" }],
        "taxid": "KUW9gi5vQAmNBYQX-5AWog"
    };

    res.end(JSON.stringify(stream));

    return;


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


}

/*
    查询时间轴
    if 不存在
        创建时间轴
    
    
    遍历请求通道参数
        根据通道号查询streamId
        if 不存在
            创建流通道，返回流ID
        else
            读取流ID

    return [tid, taxid, {chid, streamid}, ...]

*/