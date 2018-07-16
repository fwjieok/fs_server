var Db = require("./common/db-pg.js");
var db = new Db();

/*
db.get_all_storage(function (result) {
	console.log("00000: ", result);
});
*/

db.get_taxid("COWN-123-45-678", function (taxid) {
    console.log("--- taxid: ", taxid)
});

var taxid = 'efvBYmLVQUiVv4cULmwzsA';

db.get_streamid(taxid, function (infos) {
    console.log("------- infos: ", infos);

});


var Server = require("./server/server.js");
var server = new Server();
server.run();

var web = require("./web_hbs/fs-web-main.js");
web.server = server;

web.listen(8000, function () {
  console.log("web listen on 8000");

});



