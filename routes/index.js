var express = require('express');
var router = express.Router();

const constants = require('./containerList')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {containers: constants.CONTAINERS});
});

module.exports = router;
