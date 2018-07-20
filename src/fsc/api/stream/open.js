'use strict';
/*jslint vars : true*/

var uuid = require("small-uuid");

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
module.exports = function(req, res) {
    var timeline = new Timeline(req, res);
}

var flags = ["O_CREAT", "O_RDONLY", "O_RDWR"];

function Timeline(req, res) {
    this.req = req;
    this.res = res;

    this.flag = req.query.flag;
    this.data = req.query.data;

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

    this.taxid = "";
    this.tid = data.tid;
    this.channels = data.channels;
    this.chids = [];
    this.ch_index = 0;

    for (var i = 0; i < this.channels.length; i++) {
        var channel = this.channels[i];
        this.chids.push(channel.chid);
    }

    this.select_taxid();
};

Timeline.prototype.select_taxid = function() {
    var sql = "select taxid from timeline where tid = $1";
    var params = [this.tid];
    this.req.app.server.db.query(sql, params, function(error, result) {
        if (error) {
            console.log(error);
            return this.res.status(500).end();
        }

        if (result.rows.length === 0) {
            this.open_time_axis();

            return;
        }

        this.taxid = result.rows[0].taxid;
        this.open_stream(this.select_stream_info.bind(this));

    }.bind(this));
};


Timeline.prototype.open_time_axis = function(callback) {
    var sql = "insert into timeline (taxid, tid, description, t_created, t_modified) values ($1, $2, $3, now(), now()) returning taxid";
    var params = [uuid.create(), this.tid, "警云设备"];

    this.req.app.server.db.query(sql, params, function(error, result) {
        if (error) {
            console.log(error);
            return this.res.status(500).end();
        }

        this.taxid = result.rows[0].taxid;
        this.open_stream(this.select_stream_info.bind(this));
    }.bind(this));
}

Timeline.prototype.open_stream = function(callback) {
    if (this.ch_index >= this.channels.length) {
        return callback();
    }

    var channel = this.channels[this.ch_index];

    var sql = "INSERT INTO stream (streamid, taxid, chid, name, type, format, t_created, t_modified) VALUES ($1, $2, $3, $4, $5,$6, now(), now())";
    var params = [uuid.create(), this.taxid, channel.chid, channel.name, channel.type, channel.format];

    this.req.app.server.db.query(sql, params, function(error, result) {
        if (error) {
            console.log(error);
            return this.res.status(500).end();
        }

        this.ch_index++;
        this.open_stream(callback);
    }.bind(this));
}

Timeline.prototype.select_stream_info = function() {
    var sql = "SELECT chid, streamid FROM stream WHERE taxid = $1 AND chid IN ($2)";
    var params = [this.taxid, this.chids.join(",")];

    var info = {
        tid: this.tid,
        taxid: this.taxid,
        channels: []
    }

    this.req.app.server.db.query(sql, params, function(error, result) {
        if (error) {
            console.log(error);
            return this.res.status(500).end();
        }

        for (var i = 0; i < result.rows.length; i++) {
            var row = result.rows[i];
            info.channels.push({ chid: row.chid, streamid: row.streamid });
        }

        return this.res.end(JSON.stringify(info));

    }.bind(this));
}