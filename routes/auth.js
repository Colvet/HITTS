var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel')
var co = require('co');

var paginate = require('express-paginate');
var co = require('co');





router.get('/index', paginate.middleware(10,1000), async (req, res ) => {
    var getData = co(function *() {
        var user = yield UserModel.find({}).limit(req.query.limit).skip(req.skip).exec();
        return {
            user : user
        };
    });
    const [ results, itemCount ] = await Promise.all([
        UserModel.find({cap : true}).limit(req.query.limit).skip(req.skip).exec(),
        UserModel.count({cap : true})
    ]);

    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);

    getData.then(function (result) { 
        res.render('auth/index', { user : result.user, pages : pages, pageCount : pageCount});
    });
});

router.post('/pro/save', function (req, res, err) {
    
    console.log(req.body.username);
    console.log(req.body.pro);
    // var get_date=req.body.date;
    // var set_date = eval(get_date);
    // console.log(set_date);
    
    // var timetable = new TimetableModel({
    //     stu_name : req.user.stu_name,
    //     stu_num : req.user.username,
    //     lecture : req.body.lecture,
    //     year : dt.getFullYear(),
    //     date : set_date
    // });

    // if(a != ''){
    //     TimetableModel.update({stu_num : req.user.username}, {date : set_date}).exec();
    //     res.json ({ message : "update" });
        
    // }
    // else{
    //     timetable.save({});
    //     res.json ({ message : "success" });
        
        
    // }
});
    




module.exports = router;