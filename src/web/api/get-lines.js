'use strict';
/*jslint vars:true*/
module.exports = function (req, res) {
    req.app.server.db.get_storage(function (result) {
	
		var info = {};
		for (var i = 0; i < result.length; i ++) {
			var r = result[i];
			info[r.tid] = r;
		}
		//console.log(info);
		res.end(JSON.stringify(info));
    });
};

