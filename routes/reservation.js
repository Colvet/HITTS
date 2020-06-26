var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel');

var ReservationModel = require('../models/ReservationModel');

var dt = new Date();

var co = require('co');
var fs = require('fs');



router.get('/index', function(req,res){
    var getData = co(function *() {
        var reservation = yield ReservationModel.find({ year : dt.getFullYear(), month : dt.getMonth()+1, day : dt.getDate() }).exec();
        var my = yield ReservationModel.find({stu_num : req.user.username, year : dt.getFullYear(), month : dt.getMonth()+1, day : dt.getDate() }).exec();
        
        return {
            reservation : reservation,
            my : my
        };
    });

    getData.then(function (result) { 
        res.render('538/index', { reservation : result.reservation, my : result.my, year : dt.getFullYear()});
    });
    
});

router.post('/ok', function(req,res, err){
    var get_time = req.body.class;
    var set_time = eval(get_time);
    console.log(set_time.length);
    if (set_time.length==0){
        res.json({message : 'check'});
    }
    else if(set_time.length ==1){
        var class1 = new ReservationModel({
            stu_name : req.user.stu_name,
            stu_num : req.user.username,
            class : set_time[0].class,
            year : dt.getFullYear(),
            month : dt.getMonth()+1,
            day : dt.getDate()
        });
        console.log(req.user.username);
        class1.save({});
        res.json({message : 'success'});
    }
    else{
        var class1 = new ReservationModel({
            stu_name : req.user.stu_name, 
            stu_num : req.user.username,
            class : set_time[0].class,
            year : dt.getFullYear(),
            month : dt.getMonth()+1,
            day : dt.getDate()
        });
        var class2 = new ReservationModel({
            stu_name : req.user.stu_name, 
            stu_num : req.user.username,
            class : set_time[1].class,
            year : dt.getFullYear(),
            month : dt.getMonth()+1,
            day : dt.getDate()
        });
    
        class1.save({});
        class2.save({});
        res.json({message : 'success'});
    }
});

router.get('/delete/:id', function (req, res ) {
    ReservationModel.remove({ id : req.params.id }, function (err) {
        res.redirect('back');
    });
});





module.exports = router;

