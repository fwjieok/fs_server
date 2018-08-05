'use strict';
/*jslint vars : true*/

var uuid = require("small-uuid");

/*
    查询时间轴
    if 不存在
        创建时间轴    
    
    得到taxid
    
    遍历请求通道参数
        根据通道号查询streamId
        if 不存在
            创建流通道，返回流ID
        else
            更新流通道其它参数，读取流通道ID

    return [tid, taxid, {chid, streamid}, ...]

*/
module.exports = function(req, res) {
    var timeline = new Timeline(req, res);
}

var flags = ["O_CREAT", "O_RDONLY", "O_RDWR"];

function Timeline(req, res) {
    this.req  = req;
    this.res  = res;

    this.flag = req.query.flag;
    this.data = req.query.data;

    var flag  = req.query.flag;
    var data  = req.query.data;

    if (flags.indexOf(flag) < 0) {
        return res.status(400).end("flag not valid");
    }

    try {
        data = JSON.parse(data);
    } catch (e) {
        return res.status(400).end("data not valid");
    }

    this.taxid          = "";
    this.tid            = data.tid;
    this.channels       = data.channels;
    this.chids          = [];
    this.streamid_chid  = [];

    for (var i = 0; i < this.channels.length; i++) {
        var channel = this.channels[i];
        this.chids.push(channel.chid);
    }

    console.log("55555555555 ", this.channels);

    (async() => {
        var taxid = await this.open_taxid(this.tid);
        var stream_info = await this.select_streamid(taxid);

        for (var i = 0; i < this.channels.length; i++) {
            var channel = this.channels[i];
            for (var j = 0; j < stream_info.length; j ++) {
                var pair = stream_info[i];
                if (pair.chid === channel.chid) {
                    this.streamid_chid.push(pair);
                    break;
                }
            }
            if (j >= stream_info.length) {     //没找到
                var pair = await this.open_stream(channel);
                this.streamid_chid.push(pair);
            }
        }

        var info = {
            tid: this.tid,
            taxid: this.taxid,
            channels: this.streamid_chid
        };

        console.log(info);

        this.res.send(info);

    }).bind(this)(); 
};

Timeline.prototype.open_taxid = function(tid) {
    return new Promise(function(resolve) {
        var sql = "select taxid from timeline where tid = $1";
        var params = [tid];
        this.req.app.server.db.query(sql, params, function(error, result) {
            if (error) {
                console.log(error);
                return this.res.status(500).end();
            }
    
            //时间轴ID已经存在,则处理流通道信息
            if (result.rows.length > 0) {
                this.taxid = result.rows[0].taxid;                
                return resolve(this.taxid);
            }
    
            sql = "insert into timeline (taxid, tid, description, t_created, t_modified) values ($1, $2, $3, now(), now()) returning taxid";
            params = [uuid.create(), this.tid, "警云设备"];
    
            this.req.app.server.db.query(sql, params, function(error, result) {
                if (error) {
                    console.log(error);
                    return this.res.status(500).end();
                }
    
                if (result.rows.length == 0) {
                    return this.res.status(500).end("创建时间轴失败");
                }
        
                this.taxid = result.rows[0].taxid;

                resolve(this.taxid);

            }.bind(this));
    
        }.bind(this));

    }.bind(this));
    
};

Timeline.prototype.select_streamid = function(taxid) {
    var sql = "SELECT chid, streamid FROM stream WHERE taxid = $1 AND chid IN ($2)";
    var params = [this.taxid, this.chids.join(",")];

    return new Promise(function(resolve) {
        this.req.app.server.db.query(sql, params, function(error, result) {
            if (error) {
                console.log(error);
                return this.res.status(500).end();
            }
    
            var channel_info = [];
            for (var i = 0; i < result.rows.length; i++) {
                var row = result.rows[i];
                channel_info.push({ chid: row.chid, streamid: row.streamid });
            }
    
            resolve(channel_info);
    
        }.bind(this));

    }.bind(this));   
}

Timeline.prototype.open_stream = function(channel) {
    var sql = "INSERT INTO stream (streamid, taxid, chid, name, type, format, t_created, t_modified) VALUES ($1, $2, $3, $4, $5,$6, now(), now()) returning streamid, chid";
    var params = [uuid.create(), this.taxid, channel.chid, channel.name, channel.type, channel.format];

    return new Promise(function (resolve) {
        this.req.app.server.db.query(sql, params, function(error, result) {
            if (error) {
                console.log(error);
                return this.res.status(500).end();
            }
    
            console.log("9999999999 ", result.rows);
    
            resolve(result.rows[0]);
        }.bind(this));

    }.bind(this));

}

/*
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

*/