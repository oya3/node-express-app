var passport = require("passport");
// const { query, check, validationResult } = require('express-validator');
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// threejs cube
exports.threejs_cube_get = function (request, response){
  response.render("demos/threejs_cube", { title: 'cube', user: request.user });
};

// threejs bone
exports.threejs_bone_get = function (request, response){
  response.render("demos/threejs_bone", { title: 'bone', user: request.user });
};

// rank
exports.rank_get = function (request, response){
  response.render("demos/rank", { title: 'rank', user: request.user });
};
