'use strict';
/*jslint vars : true*/

var httpProxy = require('http-proxy');

module.exports = function(req, res) {
    var protocol = req.app.server.protocol;
    var fsc_host = req.app.server.fsc_host;
    var fsc_port = req.app.server.fsc_port;

    var proxy = httpProxy.createProxyServer();

    var target = protocol + '://' + fsc_host + ':' + fsc_port;
    console.log("---- fs proxy to :", target);
    var option = {
        target: target
    };

    proxy.web(req, res, option);

    proxy.on('error', function(err, req, res) {
        console.log("--- proxy error ------");
        res.status(500).end();
    });

    proxy.on('proxyReq', function(proxyReq, req, res, options) {
        proxyReq.setHeader('Host', fsc_host);
    });

};

/*             
@api {GET} /open 获取时间轴                                                                                                                                                            
@apiName open                                                                                                                                                                          
@apiVersion 1.0.0                                                                                                                                                                      
@apiGroup stream                                                                                                                                                                       
@apiDescription 获取某个设备时间轴，返回时间轴id和通道流相关信息                                                                                                                         
@apiParam {string} flag 操作标记,可为:O_CREAT | O_RDONLY | O_RDWR                                                                                                                      
@apiParam {string} data json参数                                                                                                                                                    
{                                                                                                                                                                                      
    tid: < tid > ,                                                                                                                                                                    
    channels: [{                                                                                                                                                                      
            chid: "ch-v1",                                                                                                                                                            
            name: "樊家抓拍器视频流",                                                                                                                                                 
            type: "video",                                                                                                                                                            
            format: "h264"                                                                                                                                                            
    },...]                                                                                                                                                                          
}                                                                                                                                                                              
                                                                                                                                                                                        
@apiSuccessExample {json} Response 200 Example                                                                                                                                         
HTTP/1.1 200 OK                                                                                                                                                                      
{                                                                                                                                                                                    
    tid: < tid > ,                                                                                                                                                                    
    taxid: < string > ,                                                                                                                                                               
    channels: [{                                                                                                                                                                      
            chid: < string > ,                                                                                                                                                        
            streamid: < string >                                                                                                                                                      
    },...]                                                                                                                                                                            
}                                                                                                                                                                                      
@apiUse CODE_500
*/