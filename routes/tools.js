var express = require('express');
var exec = require('child_process').exec;
var router = express.Router();


router.get('/', function(req, res, next) {

   res.render('tools', { title: 'QA Windows Console' });

});

router.get('/restart', function(req, res, next) {
  exec('net stop jenkins', function(error, stdout, stderr) {
  		  console.log('stdout: ' +stdout);
  		  console.log('stderr: ' +stderr);
  		  exec('net start jenkins', function(error, stdout, stderr) {
  		    console.log('stdout: ' +stdout);
  		    console.log('stderr: ' +stderr);
  		    res.send(stdout);
  		  })
  });
})

    
router.post('/updatesheet', function(req, res) {
		var db = req.db;
		var type = req.body.type;
		var regressionname = req.body.regressionname;
		var regressionurl = req.body.regressionurl;
		var collection = db.get('usercollection');
		
		collection.insert({
				"type" : type,
				"regressionname" : regressionname,
				"regressionurl" : regressionurl
		}, function (err, doc) {
			if (err) {
				res.send("failed to update");
			} else {
				res.send("Update successful");
			}
		});

});

module.exports = router;