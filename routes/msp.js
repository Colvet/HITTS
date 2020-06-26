var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel');
var MspModel = require('../models/MspModel');


var paginate = require('express-paginate');
var co = require('co');

var path = require('path');
var uploadDir = path.join( __dirname, '../msp_uploads' );
var fs = require('fs');

//multer 세팅
var multer = require('multer');
var storage = multer.diskStorage({
    destination : function (req, file, cb ) {
        cb(null, uploadDir);
    },
    filename : function (req, file, cb) {
        cb(null, file.originalname + '-' + Date.now() + path.extname(file.originalname)  );
    }
});
var upload = multer ({ storage : storage } );



router.get('/', paginate.middleware(7, 1000), async (req,res) => {
 
    const [ results, itemCount ] = await Promise.all([
        MspModel.find().limit(req.query.limit).skip(req.skip).exec(),
        MspModel.count({})
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    
    const pages = paginate.getArrayPages(req)( 4 , pageCount, req.query.page);
 
    res.render('msp/index', { 
        msps : results , 
        pages: pages,
        pageCount : pageCount,
    });
 
});



router.get('/write', function (req,res) {
    res.render( 'msp/form', { msp : ""});
});


router.post('/write', upload.single('record'), function (req, res) {
    var msp = new MspModel({
        title : req.body.title,
        record : (req.file) ? req.file.filename : "",
        description : req.body.description,
        writer : req.user.stu_name,
        writer_num : req.user.username,
    });
    
    msp.save(function (err) { 
        res.redirect('/hitts/msp');
    });
});

router.get('/detail/:id', function (req,res) {
    var getData = co(function *() {
        var msp = yield MspModel.findOne( { 'id' : req.params.id }).exec();
        return {
            msp : msp
        };
    });
    getData.then( function (result) {
        res.render('msp/mspDetail', { msp : result.msp });
    });
});

router.get('/edit/:id', function (req,res) {
    var getData = co(function *() {
        var msp = yield MspModel.findOne( { 'id' : req.params.id }).exec();
        return {
            msp : msp
        };
    });
    getData.then( function (result) {
        res.render('msp/form', { msp : result.msp });
    });
});

router.post('/edit/:id',upload.single('record') ,function (req, res) {
    MspModel.findOne( { id : req.params.id }, function (err, msp) {
    
        if(req.file){
            fs.unlinkSync ( uploadDir + '/' + msp.record );
        }
        
        var query = {
            title : req.body.title,
            record : (req.file) ? req.file.filename : msp.record,
            description : req.body.description,
            writer : req.user.stu_name,
            created_at : Date.now()
        };

        MspModel.update({ id : req.params.id }, {$set : query }, function (err) {
            res.redirect('/hitts/msp/detail/' + req.params.id );
        });
    });
});

router.get('/delete/:id', function (req, res ) {
    MspModel.remove({ id : req.params.id }, function (err) {
        res.redirect('/hitts/msp');
    });
});




module.exports = router;