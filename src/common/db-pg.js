'use strict';

var pg   = require('pg');
var fs   = require('fs');

function Db(config) {
    this.config = config;
    this.config['max-connections'] = 100;
    this.config['idleTimeoutMillis'] = 30000;
}

Db.prototype.query = function (sql, params, callback) {
    this.db = new pg.Pool(config);
    this.db.on('error', function (err, client) {
        console.error('pg.Pool error', err.message);
    });
};

Db.prototype.query = function (sql, params, callback) {
    if (typeof params === 'function') {
        callback = params;
        params = [];
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
// Db.prototype.get_streamid = function (taxid, callback) {
//     var infos = {
//         tid: "aaa",
//         taxid: taxid,
//         channels: []
//     };

//     (async () => {
//         var sql    = "select chid, streamid from stream where taxid = $1";
//         var result = await this.db.query(sql, [taxid]);
//         for (var i = 0; i < result.rows.length; i ++) {
//             var row = result.rows[i];
//             infos.channels.push({chid: row.chid, streamid: row.streamid});
//         }

//         //遍历请求参数channels，如果chid在上面有，就忽略？还是更新？；如果没有就insert


//         if (callback) { callback(infos); }

//     })();
// }

module.exports = Db;

