'use strict';
/*jslint vars:true*/

module.exports = function(req, res) {
    var sql = 'select hostname, port, enabled, size_total, size_used, size_free from storage order by size_free desc';

    req.app.server.db.query(sql, [], function(err, result) {
        if (err) {
            console.log(err);
            res.status(500).end(JSON.stringify(err));
        }

        for (var i = 0; i < result.length; i++) {

            console.log(result.rows[i]);
        }

        //console.log(info);
        var result = {
            storage: result.rows
        };

        res.send(result);
    });
};