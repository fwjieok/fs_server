$(function(){
    $.fn.bootstrapSwitch.defaults.size = 'small';
    $(".switch").bootstrapSwitch();

    $("form").submit(function(){
	//这里是要执行的代码
	event.preventDefault();
    });
    var credit = 0;
    var settings = {};
    $("#submit-confirm-button").click(function () {
	var s = JSON.stringify(settings);
	if (!confirm("确认保存?")) { return; };
	$.getJSON("/api/set-lines?data=" + s)
	    .done(function (data) {
		if (data.result == "OK") {
		    window.onbeforeunload = null;
		    alert("配置保存成功.");
		} else {
		    alert("配置保存失败:" + JSON.stringify(data));
		    return false;
		}
	    })
	    .fail(function(textStatus, jqXHR, error ) {
		alert("数据保存失败, 请重新保存.");
	    });
	return true;
    });
    function on_exit(e) {
	var e = e || window.event;
	// For IE and Firefox prior to version 4
	if (e) {
	    e.returnValue = '数据已修改';
	}
	// For Safari
	return '数据已修改';
    };
    var updating = false;
    function on_data_changed() {
	if (updating) { return; };
	window.onbeforeunload = on_exit;
    };
    function on_child_del() {
	var key = $(this).data().key;
	var part = settings[key];
	if (confirm("确定要删除:" + key + "(" + settings[key].name + ")" + "吗?")) {
	    delete settings[key];
	    $("#row-" + key).remove();
	    on_data_changed();
	};
	return false;
    }
    function on_child_edit() {
	var key = $(this).data().key;
	var line = settings[key];
	$("#new-number").val(key);
	$("#new-name").val(line.name);
	$("#new-hostname").val(line.hostname);
	$("#new-port").val(line.port);
	$("#new-protocol").val(line.protocol);
	$("#new-size-total").val(line.size_total);
	return false;
    }

    function on_child_enabled_changed() {
	var data = $(this).data();
	var key = data.key;
	var line = settings[key];
	var new_value;
	if ($(this).attr("checked")) {
	    new_value = true;
	} else {
	    new_value = false;
	}
	if (line.enabled != new_value) {
	    on_data_changed();
	    line.enabled = new_value;
	    $(".switch").bootstrapSwitch();
	}
    }

    function is_valid_ip(ip) {
	if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) { return false; };
	var arr = ip.split(".");
	for (var i = 0; i < arr.length; i++) {
            if (parseInt(arr[i]) > 255) { return false; };
        }
        return true;
    }
    
    function add_new_child() {
        var key		= $("#new-number").val().toString();
        var name	= $("#new-name").val();
        var hostname	= $("#new-hostname").val();
        var port	= $("#new-port").val().toString();
        var protocol	= $("#new-protocol").val();
	var size_total  = $("#new-size-size").val();
        if (!/^[0-9]$/.test(key)) {
            alert(key + ": 线路号格式错误.");
            $("#new-liine").focus();
            return false;
        }
        if (!/^[0-9]{4}$/.test(port)) {
            alert("端口号格式错误:" + port);
            $("#new-port").focus();
            return false;
        }
        if (!is_valid_ip(hostname)) {
	    alert("主机名或IP格式错误:" + hostname);
	    $("#new-hostname").focus();
	    return false;
	}

	port = parseInt(port, 10);
        if (port < 5001 || port > 10000) {
            alert(port + ": 端口号超出允许的范围");
            $("#new-port").focus();
            return false;
        }
        for (var line  in settings) {
            if (!settings.hasOwnProperty(line)) { continue; };
            if (settings[line].port === port) {
		alert(port + ": 端口号重复");
		$("#new-port").focus();
		return false;
            }
        }
        if (protocol !== 'http' && protocol !== 'https') {
            alert(protocol + ": 未知的协议类型");
            $("#new-protocol").focus();
            return false;
        }
        if (settings[key]) {
            alert(key + "扩展存储设备已经存在.");
            $("#new-line").focus();
            return false;
        }

        on_data_changed();
        settings[key] = {
            enabled  : true,
            name     : name,
            hostname : hostname,
            port     : port,
            protocol : protocol,
	    size_total: size_total
        }
        append_child(key, settings[key]);
    }
    
    function edit_child() {
        var key = $("#new-number").val().toString();
        if (!settings[key]) {
            alert(key + "线路不存在.");
            $("#new-line").focus();
            return false;
        }
        var name     = $("#new-name").val();
        var hostname = $("#new-hostname").val();
        var port     = $("#new-port").val().toString();
        var protocol = $("#new-protocol").val();
	var size_total     = $("#new-size-total").val();
        if (!/^[0-9]$/.test(key)) {
            alert(key + ": 线路号格式错误.");
            $("#new-liine").focus();
            return false;
        }
        if (!/^[0-9]{4}$/.test(port)) {
            alert("端口号格式错误:" + port);
            $("#new-port").focus();
            return false;
        }
        if (!is_valid_ip(hostname)) {
	    alert("主机名或IP格式错误:" + hostname);
	    $("#new-hostname").focus();
		return false;
		}
		
        port = parseInt(port, 10);
        if (port < 2000 || port > 10000) {
            alert(port + ": 端口号超出允许的范围");
            $("#new-port").focus();
            return false;
        }
        for (var line  in settings) {
            if (!settings.hasOwnProperty(line)) { continue; };
            if (line === key) { continue; };
            if (settings[line].port === port) {
		alert(port + ": 端口号重复");
		$("#new-port").focus();
		return false;
            }
        }
	
        if (protocol !== 'http' && protocol !== 'https') {
            alert(protocol + ": 未知的协议类型");
            $("#new-protocol").focus();
            return false;
        }
        on_data_changed();

	settings[key] = {
            enabled : true,
            name    : name,
            hostname  : hostname,
            port    : port,
            protocol : protocol,
	    size_total    : size_total
        }
        update_child(key);
    }
    
    function update_child(key) {
        var line = settings[key];
        if (!line) { return; };
        $("#row-" + key + " #col-name").text(line.name);
        $("#row-" + key + " #col-hostname").text(line.hostname);
        $("#row-" + key + " #col-port").text(line.port);
        $("#row-" + key + " #col-protocol").text(line.protocol);
	$("#row-" + key + " #col-size-total").text(line.size_total);
    }
    function append_child(key, line) {
        var list = $("#lines-list");
        var row = $("<tr>").attr("id", "row-" + key);
        var col = $("<td>")
                .addClass("center")
                .attr("id", "col-oper")
                .appendTo(row);
	$("<button>")
            .addClass("btn")
            .append($("<span>").addClass("icon-remove"))
            .click(on_child_del)
            .data({key:key, line: line})
            .appendTo(col);
	$("<button>")
            .addClass("btn")
            .append($("<span>").addClass("icon-edit"))
	    .click(on_child_edit)
	    .data({key:key, line: line})
	    .appendTo(col);
	col.appendTo(row);

	col = $("<td>").attr("id", "col-enabled").addClass("center").appendTo(row);

	var enabled = $("<input>")
		.attr("type", "checkbox")
		.addClass("switch")
		.data({key:key, line: line})
		.addClass("span4")
		.on('switchChange.bootstrapSwitch', on_child_enabled_changed);
	
	if (line.enabled) {
	    enabled.attr("checked", "true");
	}
	enabled.appendTo(col);


	$("<td>").attr("id", "col-key").addClass("center").append(key).appendTo(row);

	col = $("<td>").appendTo(row).attr("id", "col-name").append(line.name);
	col = $("<td>").appendTo(row).attr("id", "col-hostname").append(line.hostname);
	col = $("<td>").appendTo(row).attr("id", "col-port").append(line.port);
	col = $("<td>").appendTo(row).attr("id", "col-protocol").append(line.protocol);
	col = $("<td>").appendTo(row).attr("id", "col-size-total").append(line.size_total);
	row.appendTo(list);
	$(".switch").bootstrapSwitch();
    };
    $("#btn-add-child").click(add_new_child);
    $("#btn-edit-child").click(edit_child);
    
    $.getJSON("/api/get-lines", function (json) {
	settings = json;
	var list = $("#lines-list");
	list.empty();
	for (var key in settings) {
	    if (!settings.hasOwnProperty(key)) { continue; };
	    var line = settings[key];
	    append_child(key, line);
	}
	var e = $("#new-number");
	e.children().remove();
	for (var i = 0; i < 10; i++) {
	    $("<option>").val(i + 1).text( (i + 1) + "号设备").appendTo(e);
	}	 
	return;
    });
});
