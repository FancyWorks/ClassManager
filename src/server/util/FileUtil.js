/**
 * Created by Ken on 15/5/5.
 */

var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var mkdirs = function(dirpath,mode,callback) {
    if(_.isFunction(mode)) {
        callback = mode;
        mode = null;
    }
    fs.access(dirpath, fs.F_OK, function(err) {
        if(!err) {
            callback(dirpath);
        } else {
            //尝试创建父目录，然后再创建当前目录
            mkdirs(path.dirname(dirpath), mode, function(){
                fs.mkdir(dirpath, mode, callback);
            });
        }
    });
};

exports.mkdirs = mkdirs;
