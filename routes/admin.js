var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel')
var BoardModel = require('../models/BoardModel')
var BscmModel = require('../models/BscmModel')
var CpimModel = require('../models/CpimModel')
var MspModel = require('../models/MspModel')
var co = require('co');


router.get('/', function(req,res){
    res.send('admin app');
});


router.get('/index', function(req,res){
    
    var getData = co(function *() {
        var user = yield UserModel.findOne( { username : req.user.username }).exec();
        var board = yield BoardModel.find({}).limit(4).sort({created_at : -1}).exec();
        var bscm = yield BscmModel.find({}).limit(4).sort({created_at : -1}).exec();
        var cpim = yield CpimModel.find({}).limit(4).sort({created_at : -1}).exec();
        var msp = yield MspModel.find({}).limit(4).sort({created_at : -1}).exec();
        return {
            user : user,
            board : board,
            bscm : bscm,
            cpim : cpim,
            msp : msp
        };
    });
    getData.then( function (result) {
        res.render('admin/index', { user : result.user, board : result.board, bscm : result.bscm, cpim : result.cpim, msp : result.msp });
    });

});






module.exports = router;