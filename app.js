var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cookieParser= require('cookie-parser');

var flash = require('connect-flash');
var Chart = require('chart.js');
//passport
var passport = require('passport');
var session = require('express-session');

var mathjs = require('mathjs');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var autoIncrement = require('mongoose-auto-increment');

var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function () {
    console.log('mongodb connect');
});

var connect = mongoose.connect('mongodb://127.0.0.1:27017/hitts', { useMongoClient : true });
autoIncrement.initialize(connect);


var admin = require('./routes/admin');
var accounts = require('./routes/accounts');
var search = require('./routes/search');
var board = require('./routes/board');
var bscm = require('./routes/bscm');
var cpim = require('./routes/cpim');
var msp = require('./routes/msp');
var matching = require('./routes/matching');
var cap = require('./routes/cap');
var reservation = require('./routes/reservation');
var auth = require('./routes/auth');


var app = express();
var port = 3000;

// 확장자가 ejs 로 끈나는 뷰 엔진을 추가한다.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//css 적용
app.use(express.static(path.join(__dirname,'views')));

// 미들웨어 셋팅
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//업로드 path 추가
app.use('/hitts/uploads', express.static('uploads'));
app.use('/hitts/cap_uploads', express.static('cap_uploads'));
app.use('/hitts/bscm_uploads', express.static('bscm_uploads'));
app.use('/hitts/cpim_uploads', express.static('cpim_uploads'));
app.use('/hitts/msp_uploads', express.static('msp_uploads'));
app.use('/hitts/board_uploads', express.static('board_uploads'));

//static path 추가
app.use('/hitts/static', express.static('static'));

//session 관련 셋팅
var connectMongo = require('connect-mongo');
var MongoStore = connectMongo(session);

var sessionMiddleWare = session({
    secret: 'hufs',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 2000 * 60 * 60 //지속시간 2시간
    },
    store: new MongoStore({
        mongooseConnection: mongoose.connection,
        ttl: 14 * 24 * 60 * 60
    })
});
app.use(sessionMiddleWare);

app.use(passport.initialize());
app.use(passport.session());

//플래시 메시지 관련
app.use(flash());

//로그인 정보 뷰에서만 변수로 셋팅, 전체 미들웨어는 router위에 두어야 에러가 안난다
app.use(function(req, res, next) {
  app.locals.isLogin = req.isAuthenticated();
  app.locals.urlparameter = req.url; //현재 url 정보를 보내고 싶으면 이와같이 셋팅
  app.locals.userData = req.user; //사용 정보를 보내고 싶으면 이와같이 셋팅
  app.locals.req = req;
  next();
});

app.get('/asd', function(req,res){
    res.send('first app');
});

// Routing
app.use('/hitts/admin', admin);
app.use('/hitts/accounts', accounts);
app.use('/hitts/search',search);
app.use('/hitts/board',board);
app.use('/hitts/bscm',bscm);
app.use('/hitts/cpim',cpim);
app.use('/hitts/msp',msp);
app.use('/hitts/matching',matching);
app.use('/hitts/cap',cap);
app.use('/hitts/reservation',reservation);
app.use('/hitts/auth',auth);

app.listen( port, function(){
    console.log('Express listening on port', port);
});