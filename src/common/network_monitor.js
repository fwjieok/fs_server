'use strict';
/*jslint vars:true */

var exec = require('child_process').exec;

function Network_monitor(server) {
    //this.debug        = true;
    this.server       = server;
    this.net_fail_cnt = 0;
}

Network_monitor.prototype.set_net_fail = function (fail) {
    if (!fail) {
        if (this.server.net_fail) {
            this.server.log(0, "system", "", "", "Network restore");
        }
        this.server.net_fail = false;
    } else {
        if (!this.server.net_fail) {
            this.server.log(0, "system", "", "", "Network fail.");
        }
        this.server.net_fail = true;
    }
};

Network_monitor.prototype.run_monitor = function () {
    var cmd = "ping -c 1 $(route -n | awk '/^0\.0\.0\.0/{print $2}') > /dev/null; echo $?";
    exec(cmd, function (error, stdout, stderr) {
        if (this.debug) {
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
            console.log("ping result", stdout);
        }
        if (stdout[0] === "0") {
            this.net_fail_cnt = 0;
        } else {
            this.net_fail_cnt++;
            setTimeout(this.run_monitor.bind(this), 2000);
        }
        if (this.net_fail_cnt > 15) {
            this.set_net_fail(true);
        } else {
            this.set_net_fail(false);
        }
    }.bind(this));
};

Network_monitor.prototype.start = function () {
    setInterval(this.run_monitor.bind(this), 30 * 1000);
};

module.exports = Network_monitor;
