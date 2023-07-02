var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var methodOverride = require('method-override');
var flash = require("connect-flash");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var demosRouter = require('./routes/demos');

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/*
passport.serializeUser()とpassport.deserializeUser()は、Passportミドルウェアが
セッション管理とユーザー認証を行う際に呼び出される関数です。
passport.serializeUser()は、ユーザーオブジェクトをセッションに保存するための処理を行う関数です。
通常、ユーザーオブジェクトから一意の識別子（一般的にはユーザーID）を抽出し、
セッションに保存します。この処理により、セッションに保存された識別子を使用して、
後続のリクエストでユーザーを特定することができます。
passport.serializeUser()は認証成功後に呼び出されます。

passport.deserializeUser()は、セッションからユーザーオブジェクトを復元するための処理を行う関数です。
セッションから復元された識別子（ユーザーID）を使用して、データベースや永続ストレージなどから
ユーザーオブジェクトを取得します。
取得したユーザーオブジェクトは、リクエストオブジェクトに結合され、後続のルートハンドラーや
ミドルウェアで使用することができます。
passport.deserializeUser()はリクエストが発生するたびに呼び出されます。

要約すると、passport.serializeUser()は認証成功後にユーザーオブジェクトをセッションに保存し、
passport.deserializeUser()はリクエストがある度にセッションからユーザーオブジェクトを取得して
リクエストオブジェクトに結合します。
これにより、セッションに基づいたユーザーの状態管理や認証情報の利用が可能になります。
*/

// passport が ユーザー情報をシリアライズすると呼び出される
passport.serializeUser(function (id, done) {
  done(null, id);
});

// passport が ユーザー情報をデシリアライズすると呼び出される
passport.deserializeUser(async function (id, done) {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
    },
  })
  if (user === null) {
    return done(error);
  }
  done(null, user);
});
/*
passport.deserializeUser(function (id, done) {
  User.findById(id, (error, user) => {
    if (error) {
      return done(error);
    }
    done(null, user);
  });
});
*/

// passport における具体的な認証処理を設定します。
passport.use(
  "local-login",
  new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
  }, function (request, username, password, done) {
    process.nextTick(async () => {
      const user = await prisma.user.findFirst({
        where: {
          AND: [
            {username: username},
            {password: password},
          ]
        },
      })
      if (user === null) {
        // ユーザーオブジェクトが存在しない場合の処理
        return done(null, false, request.flash("message", "Invalid username or password."));
      }
      // ユーザーオブジェクトが存在する場合の処理
      return done(null, user.id);
    });
  })
);

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.basedir = path.join(__dirname, 'views');

app.use(logger('dev'));
app.use(express.json());
// Express v4.16.0 以降では body-parser(urlencoded) はデフォルトで使える
// true にすると {'address[city]': 'Los Angeles'} が {'address': { 'city': 'Los Angeles'}} としてアクセスできる 
app.use(express.urlencoded({ extended: true }));  
app.use(methodOverride(function(req, res){
  if (req.body && typeof req.body === 'object' && '_method' in req.body) {
    // look in urlencoded POST bodies and delete it
    var method = req.body._method;
    delete req.body._method;
    return method;
  }
}) );

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

// passport設定
app.use(session({ secret: "some salt", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// app.use('/scripts', express.static(path.join(__dirname, 'node_modules/chart.js/dist')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/demos', demosRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
