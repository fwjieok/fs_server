'use strict';
/*jslint vars : true*/

var uuid = require('uuid/v1');

module.exports = function (req, res) {


  var result = [];
  for (var i = 0; i < 10000; i ++) {
    var fid   = uuid();
    var fid_2 = fid.replace(/"-"/g, "");

    //result.push(fid + "       " + fid_2);
    console.log(fid + "       " + fid_2);
  }

  res.end(result.join("\n"));
};