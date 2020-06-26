var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel');
var CapModel = require('../models/CapModel');
var TeamModel = require('../models/TeamModel');
var CapFileModel = require('../models/CapFileModel');
var CapMeetModel = require('../models/CapMeetModel');



var paginate = require('express-paginate');
var co = require('co');


var path = require('path');
var uploadDir = path.join( __dirname, '../cap_uploads' );
var fs = require('fs');


var current = Date.now();
var dt = new Date();

//multer 세팅
var multer = require('multer');
var storage = multer.diskStorage({
    destination : function (req, file, cb ) {
        cb(null, uploadDir);
    },
    filename : function (req, file, cb) {
        cb(null, file.originalname + '-' + current + path.extname(file.originalname)  );
    }
});
var upload = multer ({ storage : storage } );



router.get('/index', paginate.middleware(7,1000), async (req, res) => {
    var getData = co(function *() {
        var cap = yield CapModel.find({year : dt.getFullYear()}).sort({created_at : -1}).exec();
        return {
            cap : cap,
        };
    });
    getData.then(function (result) { 
        res.render('cap/index', { cap : result.cap });
    });
});

router.get('/index/:year', paginate.middleware(7,1000), async (req, res) => {
    var getData = co(function *() {
        var cap = yield CapModel.find({year : req.params.year}).sort({created_at : -1}).exec();
        return {
            cap : cap
        };
    });
    getData.then(function (result) { 
        res.render('cap/index', { cap : result.cap });
    });
});

router.get('/write/:year', function (req,res) {
    res.render( 'cap/capform', { cap : ""});
});

router.post('/write/:year', function (req, res) {
    var cap = new CapModel({
        team_name : req.body.team_name,
        theme : req.body.theme,
        category : req.body.category,
        professional : req.body.professional,
        writer : req.user.stu_name,
        writer_num : req.user.username,
        year : req.params.year,
        result : ""

    });
    
    cap.save(function (err) { 
        res.redirect('/hitts/cap/index/'+ req.params.year);
                                   
    });
});

router.get('/index/detail/:id',function (req, res) {
    var getData = co(function *() {
        var capstone = yield CapModel.findOne( { 'id' : req.params.id } ).exec();
        var cap_file = yield CapFileModel.find( { 'num' : req.params.id } ).sort({created_at : 1}).exec();
        var cap_meet = yield CapMeetModel.find( { 'num' : req.params.id } ).sort({created_at : -1}).exec();
        var team = yield TeamModel.findOne( {$and : [{lecture : '캡스톤디자인프로젝트'}, { member : { $elemMatch : {stu_num : capstone.writer_num  }}}]} ).exec();
        return {
            capstone : capstone,
            cap_file : cap_file,
            cap_meet : cap_meet,
            team : team,
        };
    });
    getData.then( function (result) {
        res.render('cap/capDetail', { capstone : result.capstone, cap_file : result.cap_file, cap_meet : result.cap_meet, team : result.team });
    });
});

router.get('/index/delete/:id', function (req, res ) {
    CapModel.remove({ id : req.params.id }, function (err) {
        res.redirect('back');
    });
});

router.get('/index/file/delete/:id', function (req, res ) {
    CapFileModel.remove({ id : req.params.id }, function (err) {
        res.redirect('back');
    });
});

router.get('/index/meet/delete/:id', function (req, res ) {
    CapMeetModel.remove({ id : req.params.id }, function (err) {
        res.redirect('back');
    });
});

router.post('/index/file/save', function (req, res ) {
    var cap_file = new CapFileModel({
        num : req.body.num,
        class : req.body.class,
        record : req.body.record +"-"+ req.body.time + "."+ req.body.ext ,
        year : dt.getFullYear(),
        writer : req.user.stu_name,
        writer_num : req.user.username

    });
    
    cap_file.save({}, function (err) {
        res.json({message : 'success'});
    });
});


router.post('/index/meet/save', function (req, res ) {
    console.log(req.body.num);
    var cap_meet = new CapMeetModel({
        num : req.body.num,
        record : req.body.record +"-"+ req.body.time + "."+ req.body.ext ,
        writer : req.user.stu_name,
        writer_num : req.user.username,
        year : dt.getFullYear()

    });
    
    cap_meet.save({}, function (err) {
        res.json({message : 'success'});
    });
});


router.post('/file', upload.single('record'), function (req, res ) {
    if(req.file){
        res.json({message : 'success', time : current});

    }
    else {
        res.json({message : 'fail'});
    }
    
});

router.post('/result/save',  function (req, res ) {
    
    CapModel.update({id : req.body.num}, { result : req.body.result}).exec();
    res.json({message: 'success'});
    
});




 module.exports = router;