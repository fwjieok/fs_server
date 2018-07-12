'use strict';
/*jslint vars : true*/
var request = require('request');
var util    = require('util');
var fs_root = process.env.HOME + "/.fs";
var FSC     = process.env.FSC;

FSC="http://47.106.171.52:7000";
process.env.FS_TID="COWN-9JH-D9-BKW";

module.exports = function (req, res) {
    var fid = req.query.fid;
    if (!fid) {
        res.status(400).end();
        return;
    }
    var url = FSC + "/api/info?fid=%s";
    url = util.format(url, encodeURIComponent(fid));

    var option = {
        url : url,
        headers : {
            tid : process.env.FS_TID
        }
    };

    if (req.app.server.protocol == "https") {
        option.cert = req.jw.port.tls.cert;
        option.key  = req.jw.port.tls.key;
        option.ca   = req.jw.port.tls.ca;
    }
    
    request(option, function (error, response, result) {
        if (error) {
	    console.log("----------------- request fsc/info error ------------------");
	    console.log(error);
            return res.status(500).end();
        }

	if (response.statusCode !== 200) {
	    console.log("----------------- request fsc/info fail ------------------");
            console.error(response.statusCode, fid);
            return res.status(response.statusCode).end();
        }

	try {
	    result = JSON.parse(result);
	} catch (e) {
	    console.log(e);
	    return res.end(e);
	}

	/*
	if (result.storage !== process.env.FS_TID) {
	    var url = "%s://%s:%d/file/download?fid=%s";
	    url = url.format(url, result.protocol, result.hostname, result.port, fid);
            console.log("redirect to:", url);
            return res.redirect(url);
        }
	 */

        var hash = result.hash;
        var file = fs_root + "/root";
        file = file + "/" + hash.substr(-3, 3);
        file = file + "/" + hash.substr(-6, 3);
        file = file + "/" + hash;

        console.log(result, file);

	var option = {
            headers : {
                "Content-Type" : result.type,
                "Content-Disposition" : "attachment; filename*=UTF-8''" + encodeURI(result.fname)
            }
        };

	res.sendFile(file, option, function (err) {
            if (err) {
		console.error(err);
            } else {
                console.log('Sent:', file);
            }
        });
    });
    
};
