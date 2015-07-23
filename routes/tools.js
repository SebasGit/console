var express = require('express');
var child_process = require('child_process');
var router = express.Router();
var child1;
var child2;


// router.get('/', function(req, res, next) {

//    res.render('tools', { title: 'QA Windows Console' });

// });

router.get('/restart', function(req, res, next) {
  child_process.exec('net stop jenkins', function(error, stdout, stderr) {
  		  console.log('stdout: ' +stdout);
  		  console.log('stderr: ' +stderr);
  		  child_process.exec('net start jenkins', function(error, stdout, stderr) {
  		    console.log('stdout: ' +stdout);
  		    console.log('stderr: ' +stderr);
  		    res.send(stdout+stderr);
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

router.get('/startseleniumhub', function(req, res) {
	child1 = child_process.exec("c:\\node\\console\\scripts\\startSeHub.vbs", function(error, stdout, stderr) {
		res.send("Started Hub");
	});
});

router.get('/startseleniumnodes', function(req, res) {
	child2 = child_process.exec("c:\\node\\console\\scripts\\startNodes.vbs", function(error, stdout, stderr) {
		res.send("Started Nodes");
	});
});

router.get('/stopselenium', function(req, res) {
	var child = child_process.exec("taskkill /fi \"WindowTitle eq C:\\Program Files\\Java\\jre1.8.0_45\\bin\\java.exe\"", function(error, stdout, stderr) {
		console.log(stdout+stderr);
		res.send(stdout+stderr);
	});
});


module.exports = router;