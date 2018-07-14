'use strict';
/*jslint vars : true*/

module.exports = function (req, res) {

  console.log("---------- stream open -------");
  console.log(req.query);

  var stream = { 
      "tid": "COWN-1K1-KU-791",
      "channels": [{"chid": "ch-v1", "streamid": "wUnaQfBXQ+2jVwhHBnhJkQ"}],
      "taxid":"KUW9gi5vQAmNBYQX-5AWog"
  };
  
  res.end(JSON.stringify(stream));
}