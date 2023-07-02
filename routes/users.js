var express = require('express');
var router = express.Router();
var controller_user = require("../controllers/users.js");

// /* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });

// 実験:
// ログイン済みか判断する
// post されたときに、ログイン済みか判断してログインしてない場合は一律 /users/sign_in に飛ばす実験
// この関数を別 js から呼び出す場合、本ファイルを require する必要があるが、本来どうするべきかも検討が必要。。。
var authenticated = function () {
  return function (request, response, next) {
    if ( request.isAuthenticated() ) {
      return next(); // 次の処理（各http method(get,post...) の第2引数以降の可変引数（配列）に指定した次の処理に続く）
    }
    response.redirect("/users/sign_in"); // 処理中断しリダイレクト
  };
};

// render("xxx",...) の xxx は、'/' から始めた場合は絶対パスで記載すること
// '/' から始めない場合は相対パスで記載すること。
// 以下の設定に依存するっぽい。。。
// - app.set('views', path.join(__dirname, 'views')); 
// - app.locals.basedir = path.join(__dirname, 'views');

// TODO: router 各httpメソッドの第１引数はpathだけど、第２引数以降は、どうなってるのかようわからん。
//       例えば、第２引数に authenticated() を指定する場合としない場合の違いをどうやって処理しているのかとか
//       express-validator を使った場合の配列[] はどうやって処理しているのかがわからん。。。
//       上記の意味を理解するための調査が必要！！

// ユーザ一覧(index)
router.get("/", authenticated(), controller_user.index_get);

// サインイン
router.get("/sign_in", controller_user.sign_in_get);

// サインイン
router.post("/sign_in", controller_user.validate_sign_in, controller_user.sign_in_post);

// サインアウト(sign_in)
router.get("/sign_out", authenticated(), controller_user.sign_out_get);

// 新規登録(new)
router.get("/new", authenticated(), controller_user.new_get);

// 新規登録(create)
// router.post("/create", authenticated(), controller_user.create_post);
router.post("/create", authenticated(), controller_user.validate_new, controller_user.create_post);

// -------------------------------------------------------------------------------------
// '/:id' のルーティングを先に設定すると、sign_in,sign_out が :id に飲み込まれるので注意

// ユーザ表示
router.get("/:id", authenticated(), controller_user.show_get);

// ユーザ更新
router.put("/:id", authenticated(), controller_user.validate_update, controller_user.update_put);

// ユーザ削除
router.delete("/:id", authenticated(), controller_user.destory_delete);

// ユーザ変更
router.get("/:id/edit", authenticated(), controller_user.edit_get);

module.exports = router;
