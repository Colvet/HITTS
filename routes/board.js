var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel');
var BoardModel = require('../models/BoardModel');


var paginate = require('express-paginate');
var co = require('co');

var path = require('path');
var uploadDir = path.join( __dirname, '../board_uploads' );
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
        BoardModel.find().limit(req.query.limit).skip(req.skip).exec(),
        BoardModel.count({})
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    
    const pages = paginate.getArrayPages(req)( 4 , pageCount, req.query.page);
 
    res.render('board/index', { 
        boards : results , 
        pages: pages,
        pageCount : pageCount,
    });
 
});



router.get('/write', function (req,res) {
    res.render( 'board/form', { board : ""});
});


router.post('/write', upload.single('record'), function (req, res) {
    var board = new BoardModel({
        title : req.body.title,
        record : (req.file) ? req.file.filename : "",
        description : req.body.description,
        writer : req.user.stu_name,
        writer_num : req.user.username
    });
    
    board.save(function (err) { 
        res.redirect('/hitts/board');
    });
});

router.get('/detail/:id', function (req,res) {
    var getData = co(function *() {
        var board = yield BoardModel.findOne( { 'id' : req.params.id }).exec();
        return {
            board : board,
        };
    });
    getData.then( function (result) {
        res.render('board/boardDetail', { board : result.board, });
    });
});

router.get('/edit/:id', function (req,res) {
    var getData = co(function *() {
        var board = yield BoardModel.findOne( { 'id' : req.params.id }).exec();
        return {
            board : board,
        };
    });
    getData.then( function (result) {
        res.render('board/form', { board : result.board });
    });
});

router.post('/edit/:id',upload.single('record') ,function (req, res) {
    BoardModel.findOne( { id : req.params.id }, function (err, board) {
    
        if(req.file){
            fs.unlinkSync ( uploadDir + '/' + board.record );
        }
        
        var query = {
            title : req.body.title,
            record : (req.file) ? req.file.filename : board.record,
            description : req.body.description,
            writer : req.user.stu_name,
            created_at : Date.now()
        };

        BoardModel.update({ id : req.params.id }, {$set : query }, function (err) {
            res.redirect('/hitts/board/detail/' + req.params.id );
        });
    });
});

router.get('/delete/:id', function (req, res ) {
    BoardModel.remove({ id : req.params.id }, function (err) {
        res.redirect('/hitts/board');
    });
});




module.exports = router;