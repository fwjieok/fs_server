'use strict';
/*jslint vars : true*/

var util    = require('util');
var http    = require('http');
var request = require('request');

var Stream_session = require("../../stream-session.js");

var BOUNDARY = "----WebKitFormBoundaryIZDrYHwuf2VJdpHw";

module.exports = function (req, res) {
    var flag     = req.query.flag;
    var streamid = req.query.streamid;
    if (!streamid || !flag) {
        return res.status(400).end("can't get stearmid or flag");
    }

    //realstream
    if (flag === "1") {
        var stream_sessions = req.app.server.stream_sessions;
        var session = stream_sessions[streamid];
        if (!session) {
            session = new Stream_session(req.app.server);
            stream_sessions[streamid] = session;
        }

        console.log("------ on_realstream_read: ", streamid);
        return session.add_read(req, res);
    }

    //backstream
    //等待并找到对应的文件信息，然后定位fs位置，download file to client
    if (flag === "0") {
        new Reader(req, res);
    }
}

function Reader(req, res) {
    this.req = req;
    this.res = res;

    this.req_finished = false;
    this.res_finished = false;

    this.streamid = req.query.streamid;
    this.from = req.query.from;
    if (req.query.to) {
        this.to = req.query.to;
    }

    /*
    if (!this.from) {
        return res.status(400).end("from not valid");
    }
    */

    this.req.on('close', this.on_request_finished.bind(this));
    this.req.on('aborted', this.on_request_finished.bind(this));

    this.res.on('close', this.on_response_finished.bind(this));
    this.res.on('finish', this.on_response_finished.bind(this));

    this.index     = 0;
    this.data_list = [];
    this.query_data();
}

Reader.prototype.on_request_finished = function () {
    this.req_finished = true;
}

Reader.prototype.on_response_finished = function () {
    this.res_finished = true;
}

Reader.prototype.query_data = function () {
    var sql = "select storage.protocol, storage.hostname, storage.port, fid.hash, fid.fname " +
        "from fid join storage " +
        "on fid.storage = storage.tid " +
        "where fid.fname >= '2018-07-14 23:59:55.756' and fid.fname <= '2018-07-15 00:00:57.986' ORDER BY fname ASC LIMIT 1000 OFFSET 0";

    var params = [];
    this.req.app.server.db.query(sql, params, function (err, result) {
        if (err) {
            console.error(err);
            return res.status(500).end("FAIL");
        }

        console.log("query data result length: ", result.rows.length);
        this.data_list = result.rows;

        this.index = 0;
        this.process_item(this.index);

    }.bind(this));
}

Reader.prototype.process_item = function () {
    if (this.index >= this.data_list.length) {
        this.res.end('\r\n--' + BOUNDARY + '--');
        console.log("all data itme done");
        return;
    }

    var item = this.data_list[this.index];

    /*
    var req = http.get(url, function(res) {
        res.on('data', function (chunk) {

        }.bind(this));

        res.on('end', function () {

        }.bind(this));
    });

    req.on('error', function () {

    });
    */

    //此处待优化，小文件数据直接返回，大数据服务器readStream.pipe(writeStream),此处要req.on('data', ....)
    this.download_item_from_storage(item, function (error, chunk) {
        if (error) {
            console.log("fsc download file error: ", error);
            return;
        }

        console.log("-------- ", this.index, chunk.length);

        var partHeader = "\r\n--%s\r\n" +
            "content-disposition: form-data; name=\"filename\"; filename=%s\r\n" +
            "content-type:image/jpeg\r\n" +
            "datetime: %s\r\n" +
            "timestamp: %s\r\n" +
            "frames: 1\r\n" +
            "sample-rate: 4\r\n" +
            "content-length: %d\r\n" +
            "\r\n";

        partHeader = util.format(partHeader,
            BOUNDARY,
            this.data_list[this.index].fname,
            this.data_list[this.index].fname,
            (new Date(this.data_list[this.index].fname)).valueOf(),
            chunk.length
        );

        this.res.write(partHeader);
        var ret = this.res.write(chunk);
        //res.write("\r\n");

        console.log("res.write(chunk): ", ret);

        this.index ++;
        setTimeout(this.process_item.bind(this), 100);
        
    }.bind(this));
}

Reader.prototype.download_item_from_storage = function (item, callback) {
    var protocol = item.protocol;
    var hostname = item.hostname;
    var port = item.port;

    var url = "http://127.0.0.1:7001/stream/read?hash=%s&fname=%s";
    url = util.format(url, item.hash, item.fname);

    console.log("fsc stream read: " + url);

    var option = {
        url: url,
        headers: {
            tid: process.env.FS_TID
        }
    };

    //此处未测试大文件，小文件直接body包含全部
    //大文件用http.get——> req.on('data')
    request(option, function (error, response, body) {
        if (error) {
            console.log("----- fsc request stream read error --------");
            console.log(error);
            return callback(error);
        }

        if (response.statusCode === 200) {
            callback(null, body);
        }
    });
}