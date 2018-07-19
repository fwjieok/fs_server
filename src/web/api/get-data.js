'use strict';
/*jslint vars:true*/
var uuid = require("small-uuid");

module.exports = function (req, res) {
    var type = req.query.type;
    var page = req.query.page;
    var limit = req.query.limit;

    console.log(req.query);

    var result = {"code":0,"msg":"","count":1000,"data":[]};

    for (var i = (page - 1); i < page*limit; i ++) {
        result.data.push({
          id: i,
          fname: i + "",
          size: i + 1000,
          type: "text/jpeg",
          fid: uuid.create(),
          hash: uuid.create(),
          uploader: "COWN-XXX-XX-XXX",
          download_count: i * 123,
          t_upload: new Date(),
          t_expire: new Date()
        });
    }
      
    res.send(result);

};

