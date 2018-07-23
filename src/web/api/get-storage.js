'use strict';
/*jslint vars:true*/

module.exports = function(req, res) {
    var sql = 'select tid, hostname, port, enabled, size_total, size_free from storage order by size_free desc';

    req.app.db.query(sql, [], function(err, result) {
        if (err) {
            console.log(err);
            return res.status(500).end(JSON.stringify(err));
        }

        var result = {
            storage: result.rows
        };

        res.send(result);
    });
};