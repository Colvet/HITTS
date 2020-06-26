var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel');
var BscmModel = require('../models/BscmModel');


var paginate = require('express-paginate');
var co = require('co');

var path = require('path');
var uploadDir = path.join( __dirname, '../bscm_uploads' );
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



//bscm 설정
router.get('/', paginate.middleware(7, 1000), async (req,res) => {
 
    const [ results, itemCount ] = await Promise.all([
        BscmModel.find().limit(req.query.limit).skip(req.skip).exec(),
        BscmModel.count({})
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    
    const pages = paginate.getArrayPages(req)( 4 , pageCount, req.query.page);
 
    res.render('bscm/index', { 
        bscms : results , 
        pages: pages,
        pageCount : pageCount,
    });
 
});

router.get('/write', function (req,res) {
    res.render( 'bscm/form', { bscm : ""});
});


router.post('/write', upload.single('record'), function (req, res) {
    var bscm = new BscmModel({
        title : req.body.title,
        record : (req.file) ? req.file.filename : "",
        description : req.body.description,
        writer : req.user.stu_name,
        writer_num : req.user.username,
    });
    
    bscm.save(function (err) { 
        res.redirect('/hitts/bscm');
    });
});

router.get('/detail/:id', function (req,res) {
    var getData = co(function *() {
        var bscm = yield BscmModel.findOne( { 'id' : req.params.id }).exec();
        return {
            bscm : bscm
        };
    });
    getData.then( function (result) {
        res.render('bscm/bscmDetail', { bscm : result.bscm });
    });
});

router.get('/edit/:id', function (req,res) {
    var getData = co(function *() {
        var bscm = yield BscmModel.findOne( { 'id' : req.params.id }).exec();
        return {
            bscm : bscm
        };
    });
    getData.then( function (result) {
        res.render('bscm/form', { bscm : result.bscm });
    });
});

router.post('/edit/:id',upload.single('record') ,function (req, res) {
    BscmModel.findOne( { id : req.params.id }, function (err, bscm) {
    
        if(req.file){
            fs.unlinkSync ( uploadDir + '/' + bscm.record );
        }
        
        var query = {
            title : req.body.title,
            record : (req.file) ? req.file.filename : bscm.record,
            description : req.body.description,
            writer : req.user.stu_name,
            created_at : Date.now()
        };

        BscmModel.update({ id : req.params.id }, {$set : query }, function (err) {
            res.redirect('/hitts/bscm/detail/' + req.params.id );
        });
    });
});

router.get('/delete/:id', function (req, res ) {
    BscmModel.remove({ id : req.params.id }, function (err) {
        res.redirect('/hitts/bscm');
    });
});


module.exports = router;