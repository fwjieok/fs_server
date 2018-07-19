'use strict';

var pg   = require('pg');
var fs   = require('fs');

var config = {
    database: 'filedb',
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "123456",
    max: 50,
    idleTimeoutMillis: 30000
};

function Db() {
    this.db = new pg.Pool(config);
    this.db.on('error', function (err, client) {
        console.error('pg.Pool error', err.message);
    });
}

Db.prototype.query = function (sql, param, callback) {
    if (typeof param === 'function') {
        callback = param;
        param = [];
    }

    this.db.connect(function (err, client, done) {
        if (err) {
            done();
            callback(err);
        } else {
            client.query(sql, param, function (err, result) {
                done();
                callback(err, result);
            });
        }
    });
};

Db.prototype.get_usable_storage = function (callback) {
    var sql = 'select protocol, hostname, port from storage ';
    sql += 'where enabled and size_free > 0  order by size_free desc limit 1';

    this.get_storage(sql, [], callback);
};

Db.prototype.get_all_storage = function (callback) {
    var sql = 'select * from storage order by tid';

    this.get_storage(sql, [], callback);
};

Db.prototype.add_storage = function (info, callback) {
    var sql = 'insert into storage(tid, enabled, protocol, hostname, port, size_total) ';
    sql += "values($1, $2, $3, $4, $5, $6) ";
    sql += "on conflict(tid) ";
    sql += "do update set enabled=$2, protocol=$3, hostname=$4, port=$5, size_total=$6";

    var params = [info.tid, info.enabled, info.protocol, info.hostname, info.port, info.size_total];

    (async () => {
        var result = await this.db.query(sql, params);
        if (callback) { callback(result.rowCount); }
    })();
};

Db.prototype.get_taxid = function (tid, callback) {
    var taxid = null;
    (async () => {
        var sql    = "select taxid from timeline where tid = $1";
        var result = await this.db.query(sql, [tid]);
        if (result.rows.length === 0) {
            sql = "insert into timeline (taxid, tid, description, t_created, t_modified) values ($1, $2, $3, now(), now()) returning taxid";
            result = await this.db.query(sql, [uuid.create(), tid, "警云设备"]);
            if (result.rows.length === 1) {
                taxid  = result.rows[0].taxid;
            }

        } else {
            taxid = result.rows[0].taxid;
        }

        if (callback) { callback(taxid); }

    })();
}

/*

INSERT INTO stream (streamid, taxid, chid, name, type, format, t_created, t_modified) VALUES ('1111', 'efvBYmLVQUiVv4cULmwzsA', '1', '', 'picture', 'jpeg', now(), now());
INSERT INTO stream (streamid, taxid, chid, name, type, format, t_created, t_modified) VALUES ('1222', 'efvBYmLVQUiVv4cULmwzsA', '2', '', 'picture', 'jpeg', now(), now());
INSERT INTO stream (streamid, taxid, chid, name, type, format, t_created, t_modified) VALUES ('1333', 'efvBYmLVQUiVv4cULmwzsA', '3', '', 'picture', 'jpeg', now(), now());

//根据请求参数chid查询streamid
SELECT chid, streamid FROM stream WHERE taxid = 'efvBYmLVQUiVv4cULmwzsA' AND chid IN ('1', '2', '3');

//根据tid查询所有streamid
SELECT chid, streamid FROM stream WHERE taxid = 'efvBYmLVQUiVv4cULmwzsA';

//更新某个通道的信息
INSERT INTO stream (streamid, taxid, chid, name, type, format, t_created, t_modified) 
VALUES ('1333', 'efvBYmLVQUiVv4cULmwzsA', '3', '', 'picture', 'jpeg', now(), now()) 
on conflict(chid) 
do update set name=$1, type=$2, format=$3, t_modified=now();

*/
Db.prototype.get_streamid = function (taxid, callback) {
    var infos = {
        tid: "aaa",
        taxid: taxid,
        channels: []
    };

    (async () => {
        var sql    = "select chid, streamid from stream where taxid = $1";
        var result = await this.db.query(sql, [taxid]);
        for (var i = 0; i < result.rows.length; i ++) {
            var row = result.rows[i];
            infos.channels.push({chid: row.chid, streamid: row.streamid});
        }

        //遍历请求参数channels，如果chid在上面有，就忽略？还是更新？；如果没有就insert


        if (callback) { callback(infos); }

    })();
}

module.exports = Db;

