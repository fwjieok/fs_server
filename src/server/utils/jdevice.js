'use strict';

var util = require('util');
var Jdevice = {};

Jdevice.Base = function Base() {
    this.id        = null;     //设备ID(乐橙,萤石是ID,华迈是SN)
    this.sid       = null;     //设备在警云的SID
    this.logined   = false;    //该设备和警云是否连接
    this.online    = false;    //该设备本身是否在线
    this.logintime = null;     //上线时间
    this.addr      = null;     //警云地址
    this.tid       = null;     //设备TID
    this.name      = null;     //设备名称
    this.brand     = null;     //lechange,ezviz,huamai,dahua
    
    this.runtime = {};
};

Jdevice.Lock = function () {
    Jdevice.Base.call(this);
    this.followed = false;
    this.foreignkey = null;
    
    this.runtime  =  {
        profile: {
            tid        : null,
            pid        : 1003,
            brand      : null,
            model      : null,
            user_tid   : null,
            brand_key  : null
        },
        status: {
            battery : null,
            signal  : null,
            locked  : null
        },
        areas: null,
        zones: {}
    };
};

util.inherits(Jdevice.Lock, Jdevice.Base);

Jdevice.Video = function () {
    Jdevice.Base.call(this);
    this.foreignkey = null;
    this.runtime  =  {
        profile: {
            tid   : null,
            pid   : 2000,
            brand : null,
            model : null,
            name  : null,
            sdk   : null
        },
        devs: {
            self: null,
            videos: {
                'default': {
                    capture: true,
                    access : {
                        protocol    : null,
                        ip          : null,
                        port        : null,
                        user        : null,
                        pass        : null,
                        p2p         : {
                            server  : null,
                            enabled : false
                        }
                    }
                }
            }
        },
        areas: null,
        zones: null,
        flags: {
            'p2p-connected' : false,
            'storage-fail'  : false,
            'storage-full'  : false
        }
    };
};

util.inherits(Jdevice.Video, Jdevice.Base);


module.exports.Base = Jdevice.Base;
module.exports.JLock = Jdevice.Lock;
module.exports.JVideo = Jdevice.Video;

