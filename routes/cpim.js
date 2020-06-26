var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel');
var CpimModel = require('../models/CpimModel');


var paginate = require('express-paginate');
var co = require('co');

var path = require('path');
var uploadDir = path.join( __dirname, '../cpim_uploads' );
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
        CpimModel.find().limit(req.query.limit).skip(req.skip).exec(),
        CpimModel.count({})
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    
    const pages = paginate.getArrayPages(req)( 4 , pageCount, req.query.page);
 
    res.render('cpim/index', { 
        cpims : results , 
        pages: pages,
        pageCount : pageCount,
    });
 
});



router.get('/write', function (req,res) {
    res.render( 'cpim/form', { cpim : ""});
});


router.post('/write', upload.single('record'), function (req, res) {
    var cpim = new CpimModel({
        title : req.body.title,
        record : (req.file) ? req.file.filename : "",
        description : req.body.description,
        writer : req.user.stu_name,
        writer_num : req.user.username,
    });
    
    cpim.save(function (err) { 
        res.redirect('/hitts/cpim');
    });
});

router.get('/detail/:id', function (req,res) {
    var getData = co(function *() {
        var cpim = yield CpimModel.findOne( { 'id' : req.params.id }).exec();
        return {
            cpim : cpim
        };
    });
    getData.then( function (result) {
        res.render('cpim/cpimDetail', { cpim : result.cpim });
    });
});

router.get('/edit/:id', function (req,res) {
    var getData = co(function *() {
        var cpim = yield CpimModel.findOne( { 'id' : req.params.id }).exec();
        return {
            cpim : cpim
        };
    });
    getData.then( function (result) {
        res.render('cpim/form', { cpim : result.cpim });
    });
});

router.post('/edit/:id',upload.single('record') ,function (req, res) {
    CpimModel.findOne( { id : req.params.id }, function (err, cpim) {
    
        if(req.file){
            fs.unlinkSync ( uploadDir + '/' + cpim.record );
        }
        
        var query = {
            title : req.body.title,
            record : (req.file) ? req.file.filename : cpim.record,
            description : req.body.description,
            writer : req.user.stu_name,
            created_at : Date.now()
        };

        CpimModel.update({ id : req.params.id }, {$set : query }, function (err) {
            res.redirect('/hitts/cpim/detail/' + req.params.id );
        });
    });
});

router.get('/delete/:id', function (req, res ) {
    CpimModel.remove({ id : req.params.id }, function (err) {
        res.redirect('/hitts/cpim');
    });
});




module.exports = router;