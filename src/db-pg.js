'use strict';

var pg = require('pg');
var fs = require('fs');

var config = {
    database : 'filedb',
    host     : "localhost",
    port     : 5432,
    user     : "postgres",
    password : "123456",
    max      : 50,
    idleTimeoutMillis: 30000
};

function Db () {
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

Db.prototype.get_storage = function (sql, params, callback) {
    (async () => {
	var result = await this.db.query(sql, params);
	if (callback) {
	    callback(result.rows);
	}
    })();
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

    var params  = [info.tid, info.enabled, info.protocol, info.hostname, info.port, info.size_total];
    
    (async () => {
	var result = await this.db.query(sql, params);
	if (callback) { callback(result.rowCount); }
    })();
};

module.exports = Db;

