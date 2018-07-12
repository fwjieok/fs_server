

var Db = require("./server/db-pg.js");
var db = new Db();

/*
db.get_storage(function (result) {
	console.log(result);
});
*/


var Server = require("./server/server.js");
var server = new Server();
server.run();

var web = require("./web/fs-web-main.js");
web.server = server;

web.listen(8000, function () {
  console.log("web listen on 8000");

});


