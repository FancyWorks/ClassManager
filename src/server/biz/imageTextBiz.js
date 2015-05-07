/**
 * Created by md on 14-6-24.
 */

var dao = require('../dao/imageTextDao');
var db = require('../util/db');
var dbEx = require('../util/dbEx');
var logger = require('../util/logger').logger;
var privilegeBiz = require('./privilegeBiz');
var C = require('../util/const');
var ObjectUtil = require('../util/object');
var source_name = 'imagetext';
var multiparty = require('multiparty');
var fs = require('fs');
var path = require('path');
var uuid = require('node-uuid');
var fsUtil = require('../util/FileUtil');

exports.getMyListFE = function(req,res) {
    var whereParam = {};
    if(req.params.uid)
        whereParam.u_id = req.params.uid;
    return dbEx.getList(dao.tableName,whereParam,req,res);
};

exports.getMyCountFE = function(req,res) {
    var whereParam = {oid:req.session.uid,cid:req.session.cid,del:0};
    if(req.query.keyword) {
        whereParam = "oid="+req.session.uid+" and del=0";
        //需要在下列字段中模糊查找
        var arr = ['name','address','phone','comment'];
        var searchSql = 'false';
        var keyword = db.formatString(req.query.keyword);
        for(var i in arr) {
            searchSql += " or "+arr[i]+" like '%"+keyword+"%'";
        }
        whereParam += ' and ('+searchSql+')';
    }
    return dbEx.getCount(dao.tableName,whereParam,req,res);
};

exports.getById = function(req,res) {
    dbEx.getOne(dao.tableName,{oid:req.session.uid,del:0,id:req.params.id},null,req,res);
};

exports.add = function(req,res,next) {

    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        var file = files.file[0];
        var originalFilename = file.originalFilename;
        var suffix = originalFilename.substring(originalFilename.lastIndexOf('.'));
        var curDate = new Date();
        var newFileName = '/data/'+fields.uid+'_'+fields.username+'/'+(curDate.getYear()+1900)+'/'+(curDate.getMonth()+1)+'_'+curDate.getDate();
        var newFileNameForFS = '../public'+newFileName;
        var newFileNameForDB = '.'+newFileName;

        fsUtil.mkdirs(newFileNameForFS,function(){
            var uuidString = uuid.v1();
            newFileNameForFS += '/'+uuidString+suffix;
            newFileNameForDB += '/'+uuidString+suffix;

            fs.createReadStream(file.path).pipe(fs.createWriteStream(newFileNameForFS));

            db.insert(dao.tableName,{u_id:fields.uid,text:fields.text,pic_url:newFileNameForDB,pic_original_name:originalFilename}).then(function(){
                res.status(200);
                res.end();
            }).catch(function(error){
                res.status(500);
                res.end(error);
            });
        });

    });
};

exports.update = function(req,res) {
    privilegeBiz.getPrivilege(req.session,source_name).then(function(priv){
        if(priv.opt_update) {
            dbEx.update(dao.tableName,req.body,{id:req.body.id,oid:req.session.uid},req,res);
        }
        else {
            res.status(500);
            res.send(C.MSG_NO_PRIVILEGE);
        }
    });
};

exports.delete = function(req,res) {
    privilegeBiz.getPrivilege(req.session,source_name).then(function(priv){
        if(priv.opt_delete) {
            dbEx.update(dao.tableName,{del:1},{id:req.params.id,oid:req.session.uid},req,res);
        }
        else {
            res.status(500);
            res.send(C.MSG_NO_PRIVILEGE);
        }
    });
};