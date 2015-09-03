var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
	res.render('screenshots', {title: "QA Screenshots Checker"});	
});

module.exports = router;