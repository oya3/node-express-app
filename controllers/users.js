var passport = require("passport");
const { query, check, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// import { check } = require('express-validator');

// render("xxx",...) の xxx は、'/' から始めた場合は絶対パスで記載すること
// '/' から始めない場合は相対パスで記載すること。
// 以下の設定に依存するっぽい。。。
// - app.set('views', path.join(__dirname, 'views')); 
// - app.locals.basedir = path.join(__dirname, 'views'); 

// ユーザ一覧(index)
// router.get("/", authenticated(), function (request, response){
exports.index_get = async function (request, response){
  // ※ router で authenticated() を呼び出さない場合 for sample
  // // ログイン済みでないならsign_inにリダイレクト
  // if ( !req.isAuthenticated() ) {
  //   return response.redirect("/users/sign_in");
  // }
  // if( request.user.role != 'admin' ){
  //   // admin でないなら１ユーザ表示(show)にリダイレクト
  //   return response.redirect(`/users/${request.user.id}`);
  // }
  users = await prisma.user.findMany()
  response.render("users/index", { title: 'users/index', user: request.user, users: users });
  /*
  if( request.user.role != 'admin' ){
    // admin でないなら１ユーザ表示(show)にリダイレクト
    return response.redirect(`/users/${request.user.id}`);
  }
  User.find({}, function(err, users) {
    response.render("users/index", { title: 'users/index', user: request.user, users: users });
  });
  */
};

// サインイン
// router.get("/sign_in", function (request, response){
exports.sign_in_get = function (request, response){
  // flash message は app.js の passport.use() で sign-in 失敗時に設定している
  response.render("users/sign_in", { title: 'users/sign_in', username: "", message: request.flash("message") });
};

// サインイン
// router.post("/sign_in", passport.authenticate(
// exports.sign_in_post = passport.authenticate(
//   "local-login", {
//     successRedirect: "/home/rank",
//     failureRedirect: "/users/sign_in" 
//   }
// );
exports.validate_sign_in = [
  // email を username として処理している
  check('username')
    .not().isEmpty().withMessage('empty')
    .isAscii().withMessage('only ascii')
    .trim()
    .isLength({ min:3 }).withMessage('more 3 characters'),
  check('password')
    .not().isEmpty().withMessage('empty')
    .isAscii().withMessage('only ascii')
    .trim()
    .isLength({ min:3 }).withMessage('more 3 characters')
];

exports.sign_in_post = [
  function (request, response, next){
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      errors.body_errors = body_errors( errors.array() );
      let username = request.body.username == "@" ? "": request.body.username;
      // response.status(303); // see other(redirect)
      return response.render("users/sign_in", { title: 'users/sign_in', username: username, errors: errors });
    }
    next();
  },
  passport.authenticate(
    "local-login", {
      successRedirect: "/",
      failureRedirect: "/users/sign_in",
      failureFlash : true 
    }
  )
];

// サインアウト(sign_out)
// router.get("/sign_out", authenticated(), function (request, response){
exports.sign_out_get = function (request, response, next){
  request.logout(function(error) {
    if (error) { return next(error); }
    response.redirect('/');
  });
};

// 新規登録(new)
// router.get("/new", authenticated(), function (request, response){
exports.new_get = function (request, response){
  if( request.user.role != 'admin' ){
    // admin でないなら１ユーザ表示(show)にリダイレクト
    return response.redirect(`/users/${request.user.id}`);
  }
  let target_user = {};
  target_user.id = "";
  target_user.username = "";
  target_user.password = "";
  target_user.name = "";
  target_user.email = "";
  target_user.role = "";
  response.render("users/new", { title: 'users/new', user: request.user, target_user: target_user });
};

// username がすでに登録済みかを確認する
var exists_entry = async function (username) {
  const user = await prisma.user.findUnique({
    where: { username: username },
  });
  if(user){
    return true; // 存在する
  }
  return false; // 存在しない( TODO: 一律エラーを存在しないにしていいかは不明。。。 )
};

var body_errors = function (errors) {
  let out_errors = {};
  for (error of errors) {
    if(error.location != 'body') continue;
    if( !(error.param in out_errors) ){
      out_errors[error.param] = new Array();
    }
    out_errors[error.param].push(error.msg);
  }
  return out_errors;
}

exports.validate_new = [
  // check('id')
  //   .not().isEmpty().withMessage('empty')
  //   .isAscii().withMessage('only ascii')
  //   .trim()
  //   .isLength({ min:3, max: 10 }).withMessage('more 3 characters, less than 10 characters'),
  // 非同期処理ならPromise返す
  check('username')
    .not().isEmpty().withMessage('empty')
    .trim()
    .isLength({ min:3 }).withMessage('more 3 characters')
    .custom((value, { request }) => {
      return new Promise( async (resolve, reject) => {
        const user = await prisma.user.findUnique({
          where: { username: value },
        });
        if(user !== null) {
          return reject();
        } else {
          return resolve();
        }
      });
    }).withMessage('This email is already in use'),
  check('password')
    .not().isEmpty().withMessage('empty')
    .isAscii().withMessage('only ascii')
    .trim()
    .isLength({ min:3 }).withMessage('more 3 characters'),
  check('name')
    .not().isEmpty().withMessage('empty')
    .isAscii().withMessage('only ascii')
    .trim()
    .isLength({ min:3, max: 10 }).withMessage('more 3 characters, less than 10 characters'),
  check('email', "E-mail don't look like E-mail")
    .isEmail()
    .trim()
    .normalizeEmail(),
  check('role')
    .not().isEmpty().withMessage('empty')
    .isAlpha().withMessage('only ascii')
    .trim()
    .custom(function(value) {
      if ( (value == 'admin') || (value == 'user') ){
        return true;
      }
      throw new Error('illegal role');
    }).withMessage('illegal role')
];

exports.validate_update = [
  // バリデート
  check('username')
    .not().isEmpty().withMessage('empty')
    .trim()
    .isLength({ min:3 }).withMessage('more 3 characters'),
  check('password')
    .not().isEmpty().withMessage('empty')
    .isAscii().withMessage('only ascii')
    .trim()
    .isLength({ min:3 }).withMessage('more 3 characters'),
  check('name')
    .not().isEmpty().withMessage('empty')
    .isAscii().withMessage('only ascii')
    .trim()
    .isLength({ min:3, max: 10 }).withMessage('more 3 characters, less than 10 characters'),
  check('email', "E-mail don't look like E-mail")
    .isEmail()
    .trim()
    .normalizeEmail(),
  check('role')
    .not().isEmpty().withMessage('empty')
    .isAlpha().withMessage('only ascii')
    .trim()
    .custom(function(value) {
      if ( (value == 'admin') || (value == 'user') ){
        return true;
      }
      throw new Error('illegal role');
    }).withMessage('illegal role')
];

// 新規登録(create)
// router.post("/create", authenticated(), function (request, response){
exports.create_post = async function (request, response){
  if( request.user.role != 'admin' ){
    // admin でないなら１ユーザ表示(show)にリダイレクト
    return response.redirect(`/users/${request.user.id}`);
  }
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    // TODO: 前回入力した内容を保持したままなんとかしたいな。。。
    let target_user = {};
    target_user.id = request.body.id;
    target_user.username = request.body.username;
    target_user.password = ""; // TODO: request.body.password ではなく強制空文字にしておく
    target_user.name = request.body.name;
    target_user.email = request.body.email == "@" ? "": request.body.email;
    target_user.role = request.body.role;
    errors.body_errors = body_errors( errors.array() );
    // response.status(303); // see other(redirect)
    return response.render("users/new", { title: 'users/new', user: request.user, target_user: target_user, errors: errors });
    //return response.redirect('/users/new');
  }
  let user = {};
  // user.id = request.body.id;
  user.username = request.body.username;
  user.password = request.body.password;
  user.name = request.body.name;
  user.email = request.body.email;
  user.role = request.body.role;
  const createUser = await prisma.user.create({
    data: user,
  })
  if(createUser == null){
    // TODO: 前回入力した内容を保持したままなんとかしたいな。。。
    return response.redirect('/users/new');
  }
  // 生成したuser表示にリダイレクト
  response.redirect(`/users/${createUser.id}`);
}

// -------------------------------------------------------------------------------------
// '/:id' のルーティングを先に設定すると、sign_in,sign_out が :id に飲み込まれるので注意

// ユーザ表示
// router.get("/:id", authenticated(), function (request, response){
exports.show_get = async function (request, response){
  if( (request.user.role != 'admin') && (request.user.id != request.params.id)  ){
    // admin でなく、自身でもないなら、１ユーザ表示(show)にリダイレクト
    return response.redirect(`/users/${request.user.id}`);
  }
  console.log(request.params)
  const user = await prisma.user.findUnique({
    where: { id: Number(request.params.id) },
  });
  if(user){
    return response.render("users/show", { title: 'users/show', user: request.user, target_user: user });
  }
  // TODO: 失敗時の対応追加
};

// ユーザ更新
// router.put("/:id", authenticated(), function (request, response) {
exports.update_put = async function (request, response) {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    // TODO: 前回入力した内容を保持したままなんとかしたいな。。。
    let target_user = {};
    target_user.id = Number(request.body.id);
    target_user.username = request.body.username;
    target_user.password = ""; // TODO: request.body.password ではなく強制空文字にしておく
    target_user.name = request.body.name;
    target_user.email = request.body.email == "@" ? "": request.body.email;
    target_user.role = request.body.role;
    errors.body_errors = body_errors( errors.array() );
    // response.status(303); // see other(redirect)
    // response.location(`/users/${request.params.id}/edit`);
    // response.end();
    return response.render("users/edit", { title: 'users/edit', user: request.user, target_user: target_user, errors: errors });
  }
  // return response.redirect(`/users/${request.params.id}`);
  // console.log(request.body)
  // const user = await prisma.user.findUnique({
  //   where: { id: Number(request.params.id) },
  // });
  // if (user === null) {
  //   // 該当レコードがない場合、レコード一覧に表示する
  //   return response.redirect(`/users/`);
  // }
  console.log(request.body)
  let user = {}
  user.id = Number(request.body.id);
  user.username = request.body.username;
  user.password = request.body.password;
  user.name = request.body.name;
  user.email = request.body.email;
  user.role = request.body.role;
  const updateUser = await prisma.user.update({
    where: { id: Number(request.body.id) },
    data: user,
  })
  // この時点では request は死んでいる。。。なんでだ？
  if (updateUser === null) {
    // TODO: connect-flash 使ってメッセージ表示したい。。。
    // request.flash('message', 'update failure.');
    return response.redirect(`/users/${user.id}`);
  }
  // TODO: connect-flash 使ってメッセージ表示したい。。。
  // request.flash('message', 'update success.');
  response.redirect(`/users/${user.id}`);
};

// ユーザ削除
// router.delete("/:id", authenticated(), function (request, response) {
exports.destory_delete = async function (request, response) {
  // TODO: admin か sign_in ユーザ自身のみ可能
  // request.user にはデシリアライズされたuser情報が入っているっぽい。。。
  if( !((request.user.role == 'admin') || (request.user.id == request.params.id)) ){
    // admin でもなく user自身でもない場合、自身のuser表示する。いいのか？
    return response.redirect(`/users/${request.body.id}`);
  }
  const deleteUser = await prisma.user.delete({
    where: {
      id: Number(request.params.id)
    },
  })
  if (deleteUser === null) {
    return response.redirect('back');
  }
  if( request.user.id == request.params.id ){
    // user自身ならsign-outして'/'にいく
    request.logout();
    response.redirect("/");
  } else {
    // adminならsign-inのままでユーザ一覧に戻る
    // → ここに来るのはadminだけなのでユーザ一覧にリダイレクト
    response.redirect('/users/');
  }
};

// ユーザ変更
// router.get("/:id/edit", authenticated(), function (request, response){
exports.edit_get = async function (request, response){
  if( (request.user.role != 'admin') && (request.user.id != request.params.id)  ){
    // admin でなく、自身でもないなら、１ユーザ表示(show)にリダイレクト
    return response.redirect(`/users/${request.user.id}`);
  }
  const user = await prisma.user.findUnique({
    where: { id: Number(request.params.id) },
  });
  if(user){
    return response.render("users/edit", { title: 'users/edit', user: request.user, target_user: user });
  }
  // TODO: 失敗した場合の対応
};
