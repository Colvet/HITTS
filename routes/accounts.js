var express = require('express');
var router = express.Router();

var UserModel = require('../models/UserModel');

var PythonShell = require('python-shell');

var LoadEclass = require('../libs/LoadEclass');
var UpdateEclass = require('../libs/UpdateEclass');

var checkEclass = require('../libs/checkEclass'); 
var LectureNow = require('../libs/LectureNow');

var passwordHash = require('../libs/passwordHash');

// passport 적용. 모듈을 가져오는 행위.
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var co = require('co');
var dt = new Date();

passport.serializeUser(function (user, done) {
    console.log('serializeUser');
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    var result = user;
    result.password = "";  
    console.log('deserializeUser');
    done(null, result);
});

passport.use(new LocalStrategy({
        usernameField : 'username',
        passwordField : 'password',
        passReqToCallback : true
    }, 
    function (req, username, password, done) {
        UserModel.findOne({ 'username' : username, 'password' : passwordHash(password) }, function (err,user) {
            if (!user){
                return done(null, false, { message: '아이디 또는 비밀번호 오류 입니다.' });
            }else{
                return done(null, user );
            };
        });
    }
));

router.get('/', function(req, res){
    res.send('account app');
});

router.get('/join', function(req, res){     //form 보여주는것.
    res.render('accounts/join');
});

router.post('/join',async (req, res ) => {
    var User = new UserModel({
        username : req.body.username,
        password : passwordHash(req.body.password),
        stu_name : req.body.stu_name,
        email : req.body.email,
        sex : req.body.sex,
        point : '',
        now_lecture : '',
        past_lecture : ''
    });

    UserModel.findOne({username : req.body.username }, function (err, check) {
        if(check == null){
            User.save({ upsert : true }, function(err){
                res.send('<script> alert("회원가입 성공"); location.href="/hitts/accounts/eclass/join"; </script>');
            });
        } else {
            res.send('<script> alert("이미 회원 가입 하셨습니다"); location.href="/hitts/accounts/join"; </script>');
        }
    });
});

router.get('/eclass/join', function(req, res){     //form 보여주는것.
        res.render('accounts/eclass_join');
});

router.post('/eclass/join',function(req, res){
    var options = {
        mode: 'text',
        pythonPath: '',
        pythonOptions: ['-u'],
        scriptPath: '',
        args: [req.body.username, req.body.password]
    };
    PythonShell.run('Loading.py', options, function (err, results) {
        
        if (results=='fail\r') {
            res.send('<script>alert("eclass ID/pw 확인 바랍니다."); location.href="/hitts/accounts/eclass/join";</script>');
        }
        else{
            res.send('<script>alert("회원가입 성공"); location.href="/hitts/accounts/login";</script>');
        };
    });

});

router.get('/login', function(req, res){
    res.render('accounts/login', { flashMessage : req.flash().error });
});
 
router.post('/login' , 
    passport.authenticate('local', { 
        ftailureRedirect: '/hitts/accounts/login', 
        failureFlash : true 
    }), 
    function(req, res){
        res.send('<script> alert("로그인 성공"); location.href="/hitts/admin/index";</script>');
    }
);
 
router.get('/success', function(req, res){
    res.send(req.user);
});
 
 
router.get('/logout', function(req, res){
    req.logout();
    res.redirect('/hitts/accounts/login');
});


router.get('/mypage/edit', function (req,res) {
    UserModel.findOne({ username : req.user.username }, function (err, user) {
        
        res.render('accounts/edit_form', { user : user} );
    });
});

router.post('/mypage/edit', function (req, res, user) {
    
        var query = {
            password : passwordHash(req.body.password),
            stu_name : req.body.stu_name,
            email : req.body.email,
            sex : req.body.sex,
            cap : req.body.cap,
            year : dt.getFullYear(),
            score : ""
        };

        var options = {
            mode: 'text',
            pythonPath: '',
            pythonOptions: ['-u'],
            scriptPath: '',
            args: []
        };

        UserModel.update({ username : req.user.username }, {$set : query }, function (err) {
            PythonShell.run('Score.py', options, function (err, results) {
                if (results=='fail\r') {
                    res.json ({ message : "fail" });
                }
                else{ 
                    res.send('<script>alert("업데이트 성공"); location.href="/hitts/accounts/mypage/edit";</script>');
                };
            });
        });
        
    
});

router.get('/lecture/now', function (req,res) {
    UserModel.findOne({ username : req.user.username }, function (err, user) {
        
        res.render('accounts/lecture_now', { user : user} );
    });
});

router.post('/lecture/now',UpdateEclass ,function (req, res) {

    res.send('<script> alert="불러오기 성공!"</script>');
});





module.exports = router;