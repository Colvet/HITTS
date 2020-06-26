var express = require('express');
var router = express.Router();

var HistoryModel = require('../models/HistoryModel');
var UserModel = require('../models/UserModel');
var CapModel = require('../models/CapModel');

var paginate = require('express-paginate');
var co = require('co');

var path = require('path');
var uploadDir = path.join( __dirname, '../uploads' );
var fs = require('fs');
var dt = new Date();

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


router.get('/tests', paginate.middleware(7, 1000), async (req,res) => {
    var getData = co(function *() {
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        var history = yield HistoryModel.find({lecture : req.params.now_lecture}).sort({created_at : -1}).exec();
        return {
            side : side,
            history : history
        };
    });
    const [ results, itemCount ] = await Promise.all([
        HistoryModel.find().limit(req.query.limit).skip(req.skip).exec(),
        HistoryModel.count({})
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    
    const pages = paginate.getArrayPages(req)( 4 , pageCount, req.query.page);

    getData.then(function (result) { 
        res.render('search/tests', { side : result.side, pageCount : pageCount, pages : pages, history : result.history});
    });
});

router.get('/tests/:now_lecture', paginate.middleware(10, 1000), async (req,res) => {
    var getData = co(function *() {
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        var history = yield HistoryModel.find({lecture : req.params.now_lecture}).limit(req.query.limit).sort({created_at : -1}).skip(req.skip).exec();
        return {
            side : side,
            history : history
        };
    });
    const [ results, itemCount ] = await Promise.all([
        HistoryModel.find({lecture : req.params.now_lecture}).limit(req.query.limit).skip(req.skip).exec(),
        HistoryModel.count({})
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    
    const pages = paginate.getArrayPages(req)( 5 , pageCount, req.query.page);

    getData.then(function (result) { 
        res.render('search/tests', { side : result.side, pageCount : pageCount, pages : pages, history : result.history});
    });
});

router.get('/tests/write/:now_lecture', function (req,res) {
    res.render( 'search/form', { history : "", });
});

router.post('/tests/write/:now_lecture', upload.single('record'), function (req, res) {
    var history = new HistoryModel({
        title : req.body.title,
        lecture : req.params.now_lecture,
        year : dt.getFullYear(),
        term : req.body.term,
        record : (req.file) ? req.file.filename : "",
        description : req.body.description,
        writer : req.user.username
    });
    
    history.save(function (err) { 
        res.redirect('/hitts/search/tests/' + req.params.now_lecture);
    });
});

router.get('/tests/detail/:id', function (req,res) {
    var getData = co(function *() {
        var history = yield HistoryModel.findOne( { 'id' : req.params.id }).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        return {
            history : history,
            side, side
        };
    });
    getData.then( function (result) {
        res.render('search/testsDetail', { history : result.history, side : result.side });
    });
});

router.get('/tests/edit/:id', function (req,res) {
    var getData = co(function *() {
        var history = yield HistoryModel.findOne( { 'id' : req.params.id }).exec();
        return {
            history : history,
        };
    });
    getData.then( function (result) {
        res.render('search/form', { history : result.history, });
    });
});

router.post('/tests/edit/:id',upload.single('record') ,function (req, res) {
    HistoryModel.findOne( { id : req.params.id }, function (err, history) {
    
        if(req.file){
            fs.unlinkSync ( uploadDir + '/' + history.record );
        }
        
        var query = {
            title : req.body.title,
            year : dt.getFullYear(),
            term : req.body.term,
            record : (req.file) ? req.file.filename : history.record,
            description : req.body.description,
            created_at : Date.now(),
            writer : req.user.username
        };
        
        HistoryModel.update({ id : req.params.id }, {$set : query }, function (err) {
            res.redirect('/hitts/search/tests/detail/' + req.params.id );
        });
    });
});

router.get('/tests/delete/:id', function (req, res ) {
    HistoryModel.remove({ id : req.params.id }, function (err) {
        res.redirect('back');
    });
});





module.exports = router;