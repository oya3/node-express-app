var express = require('express');
var router = express.Router();

/* GET index page. */
router.get('/', function(request, response, next) {
  // if ( request.isAuthenticated() ) {
  //   // ログイン済みなら 別ページにリダイレクトさせることもできる
  //   return res.redirect("/");
  // }
  response.render('index', { title: 'Express', user: request.user });
});

module.exports = router;
