var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel');
var InviteModel = require('../models/InviteModel');
var TeamModel = require('../models/TeamModel');

var RandomModel = require('../models/RandomModel');

var ProjectModel = require('../models/ProjectModel');
var PreferModel = require('../models/PreferModel');
var TimetableModel = require('../models/TimetableModel');

var PythonShell = require('python-shell');

var TeamRandom = require('../libs/TeamRandom');
var Sendemail = require('../libs/SendEmail');

var paginate = require('express-paginate');
var paginate2 = require('express-paginate');
var co = require('co');
var fs = require('fs');

var dt = new Date();

function setting(data) {
    for(var i =0; i< data.length ; i++){
        if(data[i] == ','){
            var sett = data.split(",");
        }
    }
    return sett
};


router.get('/index', function (req, res) {
    var getData = co(function *() {
        var user = yield UserModel.findOne({username : req.user.username}).exec();
        var team = yield TeamModel.find({member : { $elemMatch : { stu_num : req.user.username, stu_name : req.user.stu_name}}, year : dt.getFullYear()}).sort({lecture :1}).exec();
        var my = yield InviteModel.find({get_num : req.user.username, okay : true, year : dt.getFullYear()}).sort({lecture:1}).exec();
        var invite = yield InviteModel.find({send_num : req.user.username ,year : dt.getFullYear()});
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        return {
            user : user,
            my : my,
            team : team,
            invite : invite,
            side : side
        };
    });
    getData.then(function (result) { 
        res.render('matching/index', { user : result.user, my : result.my, team : result.team, invite : result.invite, side : result.side});
    });
});


router.get('/index/:now_lecture', paginate.middleware(10,1000),async(req, res) =>{
    var getData = co(function *() {
        var user = yield UserModel.find({now_lecture : req.params.now_lecture, pro : false}).limit(req.query.limit).skip(req.skip).exec();
        var my = yield UserModel.findOne({username : req.user.username}).exec();
        var team = yield TeamModel.find({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        return {
            user : user,
            my : my,
            team : team,
            side : side
        };
    });

    const [ results, itemCount ] = await Promise.all([
        UserModel.find({now_lecture : req.params.now_lecture, pro : false}).limit(req.query.limit).skip(req.skip).exec(),
        UserModel.count({now_lecture : req.params.now_lecture})
    ]);1

    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);

    getData.then(function (result) { 
        res.render('matching/form', { user : result.user, my : result.my, team : result.team, side : result.side, pages : pages, pageCount : pageCount});
    });
});




router.post('/index/invite', function (req, res, err) {
    InviteModel.find({lecture: req.body.lecture, send_num : req.body.send_num, get_num : req.body.get_num }, function (err,a) {
        var invite = new InviteModel({
            lecture : req.body.lecture,
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : req.body.get_num, 
            get_name : req.body.get_name,
            year : dt.getFullYear(),
            okay : true
        });
        Sendemail(req.body.lecture, req.body.send_name, req.body.get_email);
        if(a != ''){
            invite.update({});
            res.json ({ message : "fail" });
        }
        else{
            invite.save({});
            res.json ({ message : "success" });

        }
    });
    
});



router.post('/index/invite2', function (req, res, err) {
    var get_name = req.body.get_name;
    var get_num = req.body.get_num;
    
    var set_name = setting(get_name);
    var set_num = setting(get_num);
    

    var getData = co(function *() {
        var e1 = yield UserModel.findOne({username : set_num[0], stu_name : set_name[0]},{email : true}).exec();
        var e2 = yield UserModel.findOne({username : set_num[1], stu_name : set_name[1]},{email : true}).exec();
        var u1 = yield InviteModel.findOne({lecture : req.body.lecture, year : dt.getFullYear(),send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[0], get_name : set_name[0]}).exec();
        var u2 = yield InviteModel.findOne({lecture : req.body.lecture, year : dt.getFullYear(),send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[1], get_name : set_name[1]}).exec();
        return {
            u1 : u1,
            u2 : u2,
            e1 : e1,
            e2 : e2
        };
    });

    getData.then(function (result) { 
        var invite1 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[0], 
            get_name : set_name[0],
            okay : true
        });
        var invite2 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[1], 
            get_name : set_name[1],
            okay : true
        }); 

        if(result.u1 == null){
            Sendemail(req.body.lecture, req.body.send_name, result.e1);
            invite1.save({});    
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e1);
            invite1.update({});
        };
        if(result.u2 ==null){
            Sendemail(req.body.lecture, req.body.send_name, result.e2);
            invite2.save({});
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e2);
            invite2.update({});
        };
        
        res.json({message : 'success'});
    });
    
});

router.post('/index/invite3', function (req, res, err) {
    var get_name = req.body.get_name;
    var get_num = req.body.get_num;
    
    var set_name = setting(get_name);
    var set_num = setting(get_num);
    

    var getData = co(function *() {
        var e1 = yield UserModel.findOne({username : set_num[0], stu_name : set_name[0]},{email : true}).exec();
        var e2 = yield UserModel.findOne({username : set_num[1], stu_name : set_name[1]},{email : true}).exec();
        var e3 = yield UserModel.findOne({username : set_num[2], stu_name : set_name[2]},{email : true}).exec();
        var u1 = yield InviteModel.findOne({lecture : req.body.lecture,year : dt.getFullYear(), send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[0], get_name : set_name[0]}).exec();
        var u2 = yield InviteModel.findOne({lecture : req.body.lecture, year : dt.getFullYear(),send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[1], get_name : set_name[1]}).exec();
        var u3 = yield InviteModel.findOne({lecture : req.body.lecture, year : dt.getFullYear(),send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[2], get_name : set_name[2]}).exec();
        return {
            u1 : u1,
            u2 : u2,
            u3 : u3,
            e1 : e1,
            e2 : e2,
            e3 : e3,
        };
    });

    getData.then(function (result) { 
        var invite1 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[0], 
            get_name : set_name[0],
            
            okay : true
        });
        var invite2 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[1], 
            get_name : set_name[1],
            okay : true
        }); 
        var invite3 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[2], 
            get_name : set_name[2],
            okay : true
        }); 

        if(result.u1 == null){
            Sendemail(req.body.lecture, req.body.send_name, result.e1);
            invite1.save({});    
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e1);
            invite1.update({});
        };

        if(result.u2 ==null){
            Sendemail(req.body.lecture, req.body.send_name, result.e2);
            invite2.save({});
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e2);
            invite2.update({});
        };

        if(result.u3 ==null){
            Sendemail(req.body.lecture, req.body.send_name, result.e3);
            invite3.save({});
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e3);
            invite3.update({});
        };
        
        res.json({message : 'success'});
    });
    
});

router.post('/index/invite4', function (req, res, err) {
    var get_name = req.body.get_name;
    var get_num = req.body.get_num;
    
    var set_name = setting(get_name);
    var set_num = setting(get_num);
    

    var getData = co(function *() {
        var e1 = yield UserModel.findOne({username : set_num[0], stu_name : set_name[0]},{email : true}).exec();
        var e2 = yield UserModel.findOne({username : set_num[1], stu_name : set_name[1]},{email : true}).exec();
        var e3 = yield UserModel.findOne({username : set_num[2], stu_name : set_name[2]},{email : true}).exec();
        var e4 = yield UserModel.findOne({username : set_num[3], stu_name : set_name[3]},{email : true}).exec();
        var u1 = yield InviteModel.findOne({lecture : req.body.lecture,year : dt.getFullYear(), send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[0], get_name : set_name[0]}).exec();
        var u2 = yield InviteModel.findOne({lecture : req.body.lecture, year : dt.getFullYear(), send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[1], get_name : set_name[1]}).exec();
        var u3 = yield InviteModel.findOne({lecture : req.body.lecture, year : dt.getFullYear(), send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[2], get_name : set_name[2]}).exec();
        var u4 = yield InviteModel.findOne({lecture : req.body.lecture,year : dt.getFullYear(), send_num : req.body.send_num, send_name : req.body.send_name, get_num : set_num[3], get_name : set_name[3]}).exec();
        return {
            u1 : u1,
            u2 : u2,
            u3 : u3,
            u4 : u4,
            e1 : e1,
            e2 : e2,
            e3 : e3,
            e4 : e4,
        };
    });

    getData.then(function (result) { 
        var invite1 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[0], 
            get_name : set_name[0],
            okay : true
        });
        var invite2 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[1], 
            get_name : set_name[1],
            okay : true
        }); 
        var invite3 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[2], 
            get_name : set_name[2],
            okay : true
        }); 
        var invite4 = new InviteModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            send_num : req.body.send_num, 
            send_name : req.body.send_name, 
            get_num : set_num[3], 
            get_name : set_name[3],
            okay : true
        }); 

        if(result.u1 == null){
            Sendemail(req.body.lecture, req.body.send_name, result.e1);
            invite1.save({});    
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e1);
            invite1.update({});
        };

        if(result.u2 ==null){
            Sendemail(req.body.lecture, req.body.send_name, result.e2);
            invite2.save({});
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e2);
            invite2.update({});
        };

        if(result.u3 ==null){
            Sendemail(req.body.lecture, req.body.send_name, result.e3);
            invite3.save({});
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e3);
            invite3.update({});
        };

        if(result.u4 ==null){
            Sendemail(req.body.lecture, req.body.send_name, result.e4);
            invite4.save({});
        } else {
            Sendemail(req.body.lecture, req.body.send_name, result.e4);
            invite4.update({});
        };
        
        res.json({message : 'success'});
    });
    
});






router.post('/index/reinvite', function (req, res, err) {
    InviteModel.find({lecture: req.body.lecture, year : dt.getFullYear(),send_num : req.body.send_num, get_num : req.body.get_num }, function (err,a) {
        InviteModel.update({lecture: req.body.lecture, year : dt.getFullYear(),send_num : req.body.send_num, get_num : req.body.get_num },{okay : true}, function (err) {

            res.json ({ message : "success" });

        });

    });
});


router.post('/index/invite/ok', function (req, res) {

    InviteModel.remove({lecture : req.body.lecture, send_num : req.body.send_num, get_num : req.body.get_num, year : dt.getFullYear()}).exec();
    TeamModel.find( {$and : [{lecture : req.body.lecture, year : dt.getFullYear()}, { member : { $elemMatch : {stu_num : req.body.send_num, stu_name : req.body.send_name }}}]}, function (err, a ) {
        member = new TeamModel({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            member : [{stu_name : req.body.send_name, stu_num : req.body.send_num }, {stu_name : req.body.get_name, stu_num : req.body.get_num}] 
            
        });
        st = {$and : [{lecture : req.body.lecture}, { member : { $elemMatch : {stu_name : req.body.send_name,stu_num : req.body.send_num }}}]};
        
        query = {
            member : {stu_num : req.body.get_num, stu_name : req.body.get_name }
        };  
        if (a == '' ){
            member.save({},function (err) {
                res.json({message: 'success'});

              });
        }
        else {
            
            TeamModel.update(st, {$addToSet :query},function (err) {   
                res.json({message : 'fail'});
            });

        }
    });
});

router.post('/index/invite/no', function (req, res) {
    InviteModel.findOne({lecture: req.body.lecture, year : dt.getFullYear(),send_num : req.body.send_num, get_num : req.body.get_num }, function (err,invite) {

        InviteModel.update({lecture: req.body.lecture, year : dt.getFullYear(),send_num : req.body.send_num, get_num : req.body.get_num }, { okay : false }, function (err) {
            
            res.json({message: 'success'});
        }); 
    });
});

router.get('/algo/random/:now_lecture',function (req, res) {
    var getData = co(function *() {
        var my = yield UserModel.findOne({username : req.user.username}).exec();
        var team = yield TeamModel.find({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        return {
            my : my,
            team : team,
            side : side
        };
    });
    getData.then(function (result) { 
        res.render('matching/random', { my : result.my, team : result.team, side : result.side});
    });

});



router.post('/algo/random',function (req, res,err) {
        
    if(req.body.limit === '0') {
        res.json ({ message : "fail" });
    }
    else{
        TeamRandom(req.body.lecture, req.body.limit);
        res.json ({ message : "success" });
    }

});


router.get('/algo/project/:now_lecture',function (req, res) {
    var getData = co(function *() {
        var my = yield UserModel.findOne({username : req.user.username}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        var project = yield ProjectModel.findOne({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();
        return {
            my : my,
            side : side,
            project : project
        };
    });
    getData.then(function (result) { 
        res.render('matching/project', { my : result.my, side : result.side, project : result.project });
    });

});

router.post('/algo/project_title/save', function (req, res) {
    ProjectModel.findOne({lecture : req.body.lecture,year : dt.getFullYear()}, function (err, check) {
        var get_title = req.body.title;
        var set_title = eval(get_title);

        for(var i = 0; i < set_title.length;i++){
            if(set_title[i].title_name == ''){
                set_title.splice(i,1);
            }
        };
        
        var project_save = new ProjectModel ({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            writer_num : req.user.username,
            title : set_title
        });
        if(err){
            res.json({message : "fail"});
        }
        else if(check == null){
            project_save.save({});
            res.json({message : "success"});
        }
        else {
            ProjectModel.update({lecture : req.body.lecture,year : dt.getFullYear()}, {title : set_title}).exec();
            PreferModel.remove({lecture : req.body.lecture,year : dt.getFullYear()}).exec();
            res.json({message : "??"});

        }
        
    });
    
});

router.get('/algo/project/prefer/:now_lecture',function (req, res) {
    var getData = co(function *() {
        var my = yield UserModel.findOne({username : req.user.username}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        var project = yield ProjectModel.findOne({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();
        var pre = yield PreferModel.findOne({lecture : req.params.now_lecture, year : dt.getFullYear(),stu_num : req.user.username,}).exec();
        return {
            my : my,
            side : side,
            project : project,
            pre : pre
        };
    });
    getData.then(function (result) { 
        res.render('matching/prefer', { my : result.my, side : result.side, project : result.project, pre : result.pre });
    });

});

router.post('/algo/project_prefer/save', function (req, res,err) {
    PreferModel.findOne({lecture : req.body.lecture, stu_num : req.user.username,year : dt.getFullYear()}, function (err, check) {
        var get_prefer=req.body.prefer;
        var set_prefer = eval(get_prefer);

        var prefer = new PreferModel ({
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            stu_name : req.body.stu_name,
            stu_num : req.user.username,
            prefer : set_prefer,
            assign : "?"
        });
        
        if(err){
            res.json({message : "fail"});
        }
        else if(check == null){
            prefer.save({});
            res.json({message : "success"});
        }
        else {
            PreferModel.update({lecture : req.body.lecture, stu_num : req.user.username,year : dt.getFullYear()}, {prefer : set_prefer}).exec();
            res.json({message : "??"});
        }
    })
});

router.get('/algo/project/prefer_show/:now_lecture',function (req, res) {
    var getData = co(function *() {
        var user = yield UserModel.find({now_lecture : req.params.now_lecture, pro : false}).exec();
        var pre = yield PreferModel.find({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        var project = yield ProjectModel.findOne({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();

        return {
            user : user,
            side : side,
            pre : pre,
            project : project
        };
    });
    getData.then(function (result,req) { 
        if( result.project != null){
            res.render('matching/prefer_show', {user : result.user, side : result.side, pre : result.pre, project : result.project });
        }
        else{
            res.send('<script> alert("프로젝트 주제를 입력해 주세요"); history.back(0); </script>');
        }
    });

});

router.get('/algo/project/prefer_show/:now_lecture',function (req, res) {
    var getData = co(function *() {
        var user = yield UserModel.find({now_lecture : req.params.now_lecture, pro : false}).exec();
        var pre = yield PreferModel.find({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        var project = yield ProjectModel.findOne({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();

        return {
            user : user,
            side : side,
            pre : pre,
            project : project
        };
    });
    getData.then(function (result,req) { 
        if( result.project != null){
            res.render('matching/prefer_show', {user : result.user, side : result.side, pre : result.pre, project : result.project });
        }
        else{
            res.send('<script> alert("프로젝트 주제를 입력해 주세요"); history.back(0); </script>');
        }
    });

});
router.get('/algo/gender/:now_lecture', paginate.middleware(10,1000), async (req, res) => {
    var getData = co(function *() {
        var user = yield UserModel.find({now_lecture : req.params.now_lecture, pro : false}).limit(req.query.limit).skip(req.skip).exec();
        var team = yield TeamModel.find({lecture : req.params.now_lecture,year : dt.getFullYear()}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        var men = yield UserModel.find({now_lecture : req.params.now_lecture, sex : '0'}).count().exec();
        var women = yield UserModel.find({now_lecture : req.params.now_lecture, sex : '1'}).count().exec();
        return {
            user : user,
            team, team,
            side : side,
            men : men,
            women : women
        };
    });
    const [ results, itemCount ] = await Promise.all([
        UserModel.find({now_lecture : req.params.now_lecture, pro : false}).limit(req.query.limit).skip(req.skip).exec(),
        UserModel.count({now_lecture : req.params.now_lecture})
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);

    getData.then(function (result,req) { 
        res.render('matching/gender', {user : result.user, team : result.team, side : result.side, pageCount : pageCount, pages : pages, men : result.men, women : result.women });

    });

});

router.get('/algo/prefer/run/:now_lecture',function (req, res ) {

    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [req.params.now_lecture]
    };
    PythonShell.run('AlgoPrefer.py', options, function (err, results) {
        if (results=='fail\r') {
            res.send('<script>alert("다시 눌러주세요"); location.reload(); </script>');
        }
        else{
            res.send('<script>alert("성공"); location.href = document.referrer; </script>');
        };
    });
});



router.post('/algo/gender/random',function (req, res) {
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [req.body.lecture, req.body.limit]
    };
    // TeamModel.remove({lecture : req.body.lecture}).exec();
    if(req.body.limit === '0') {
        res.json ({ message : "fail" });
    }
    else{
        PythonShell.run('GenderRandom.py', options, function (err, results) {
            if (results=='fail\r') {
                res.json ({ message : "fail" });
            }
            else{
                res.json ({ message : "success" });
            };
        });
    }

});

router.get('/recommend/index', paginate.middleware(10,1000), async (req, res ) => {
    var getData = co(function *() {
        var user = yield UserModel.find({cap : true, pro : false}).limit(req.query.limit).skip(req.skip).exec();
        var my = yield UserModel.findOne({username : req.user.username}).exec();
        var team = yield TeamModel.find({lecture : '캡스톤디자인프로젝트'}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        return {
            user : user,
            my : my,
            team : team,
            side : side
        };
    });
    const [ results, itemCount ] = await Promise.all([
        UserModel.find({cap : true}).limit(req.query.limit).skip(req.skip).exec(),
        UserModel.count({cap : true})
    ]);

    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);

    getData.then(function (result) { 
        res.render('matching/recform', { user : result.user, my : result.my, team : result.team, side : result.side, pages : pages, pageCount : pageCount});
    });
});

router.get('/recommend/chart',paginate.middleware(4,1000),async (req, res ) => {
    var getData = co(function *() {
        var user = yield UserModel.find({cap : true, pro : false}).limit(req.query.limit).skip(req.skip).exec();
        var my = yield UserModel.findOne({username : req.user.username}).exec();
        var team = yield TeamModel.find({lecture : '캡스톤디자인프로젝트'}).exec();  
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        return {
            user : user,
            my : my,
            team : team,
            side : side
        };
    });

    const [ results, itemCount ] = await Promise.all([
        UserModel.find({cap : true}).limit(req.query.limit).skip(req.skip).exec(),
        UserModel.count({cap : true})
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    const pages = paginate.getArrayPages(req)(4, pageCount, req.query.page);

    getData.then(function (result) { 
        res.render('matching/chart', { user : result.user, my : result.my, team : result.team, side : result.side, pages : pages, pageCount : pageCount});
    });
});

router.get('/recommend/people', async (req, res ) => {
    var getData = co(function *() {
        var user = yield UserModel.find({cap : true, pro : false}).exec();
        var my = yield UserModel.findOne({username : req.user.username}).exec();
        var team = yield TeamModel.find({lecture : '캡스톤디자인프로젝트'}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        var my_team = yield TeamModel.find({$and : [{lecture : '캡스톤디자인프로젝트'}, { member : { $elemMatch : {stu_num : req.user.username, stu_name : req.user.stu_name }}}]}).exec()
        return {
            user : user,
            my : my,
            team : team,
            side : side,
            my_team : my_team
        };
    });
    

    getData.then(function (result) { 
        res.render('matching/teamchart', { user : result.user, my : result.my, team : result.team, side : result.side, my_team : result.my_team});
    });
});

router.get('/algo/timetable/:now_lecture', paginate.middleware(10,1000),async(req, res) =>{
    var getData = co(function *() {
        var user = yield TimetableModel.find({lecture : req.params.now_lecture, year : dt.getFullYear()}).exec();
        var time = yield TimetableModel.findOne({lecture : req.params.now_lecture, stu_num : req.user.username, year : dt.getFullYear()}).exec();
        var side = yield UserModel.findOne({username : req.user.username}).exec();
        
        return {
            user : user,
            time : time,
            side : side
        };
    });
    

    getData.then(function (result) { 
        res.render('matching/time', { user : result.user, time : result.time, side : result.side});
    });
});

router.post('/algo/time/save', function (req, res, err) {
    TimetableModel.find({lecture: req.body.lecture, year : dt.getFullYear(),stu_name : req.user.stu_name, stu_num : req.user.username, }, function (err,a) {
        
        var get_date=req.body.date;
        var set_date = eval(get_date);
        console.log(set_date);
        
        var timetable = new TimetableModel({
            stu_name : req.user.stu_name,
            stu_num : req.user.username,
            lecture : req.body.lecture,
            year : dt.getFullYear(),
            date : set_date
        });

        if(a != ''){
            TimetableModel.update({stu_num : req.user.username}, {date : set_date}).exec();
            res.json ({ message : "update" });
            
        }
        else{
            timetable.save({});
            res.json ({ message : "success" });
            
           
        }
    });
    
});






module.exports = router;
