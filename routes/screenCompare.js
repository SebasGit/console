var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
	res.render('screenCompare', {title: "QA Screenshots Comparison"});	
});

module.exports = router;