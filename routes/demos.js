var express = require('express');
var router = express.Router();
var controller_demos = require("../controllers/demos.js");

/* GET home page. */
router.get("/", controller_demos.threejs_cube_get);

/* GET cube page. */
router.get("/threejs_cube", controller_demos.threejs_cube_get);

/* GET bone page. */
router.get("/threejs_bone", controller_demos.threejs_bone_get);

/* GET rank page. */
router.get("/rank", controller_demos.rank_get);

module.exports = router;
