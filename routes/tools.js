var express = require('express');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });
var child_process = require('child_process');
var Grid = require('gridfs-stream');
var mongo = require('mongodb');
var fs = require('fs');
var router = express.Router();
var child1;
var child2;

router.post('/picture', upload.single('file'), function (req, res, next) {
	db = req.db
	var gfs = Grid(db, mongo);
	var writestream = gfs.createWriteStream({ 
	    filename: req.file.originalname
	});
	writestream.on('close', function (file) {
		var release = req.body.release;
		var classname = req.body.classname;
		var testname = req.body.testname;
		var collection = db.get('usercollection');
	
		collection.insert({
				"type" : "screenshot",
				"ssId" : file._id.toString(),
				"release" : release,
				"classname" : classname,
				"testname" : testname,
				"unverified" : true
		});
    });
	fs.createReadStream(req.file.path)
    	.on('end', function() {
    	res.send('OK');
  	})
  	.on('error', function() {
  		res.send('ERR');
 	})
    .pipe(writestream);
});

router.get('/download', function(req, res) {
	var gfs = Grid(req.db, mongo);
	res.set('Content-Type', 'image/jpeg');
    gfs.createReadStream({ _id:req.param('id') }).pipe(res);
});

router.get('/', function(req, res, next) {
   res.render('tools');
});

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
	var type = req.body.type;
	var regressionname = req.body.regressionname;
	var regressionurl = req.body.regressionurl;
	var collection = req.db.get('usercollection');
	
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