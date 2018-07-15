'use strict';
/*jslint vars : true*/

var fs_root = process.env.HOME + "/.fs";

module.exports = function (req, res) {
  var hash  = req.query.hash;
  var fname = req.query.fname;
  var file  = fs_root + "/root";

  file = file + "/" + hash.substr(-3, 3);
  file = file + "/" + hash.substr(-6, 3);
  file = file + "/" + hash;

  console.log("******* fs_stream_read: ", file);

  var option = {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURI(fname)
    }
  };

  res.sendFile(file, option, function (err) {
    if (err) {
      return console.error(err);
    }

    console.log('Sent ok:', file);
  });
};


