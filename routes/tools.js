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

router.post('/screenshot', upload.single('file'), function (req, res, next) {
	db = req.db
	var gfs = Grid(db, mongo);
	var release = req.body.release;
	var page = req.body.page;
	var classname = req.body.classname;
	var testname = req.body.testname;
	var number = req.body.number;
	var collection = db.collection('usercollection');
	collection.find({release: release, classname: classname, testname: testname, number: number}).toArray(function(err, screenshots) {
		screenshots.forEach(function(screenshot) {
			gfs.remove({"_id":screenshot.ssId});
			collection.remove({"_id":screenshot._id});
		});
	});
	var writestream = gfs.createWriteStream({ 
	    filename: req.file.originalname
	});
	writestream.on('close', function (file) {
		collection.insert({
			"type" : "screenshot",
			"ssId" : file._id.toString(),
			"release" : release,
			"page" : page,
			"classname" : classname,
			"testname" : testname,
			"qename": "",
			"number" : number,
			"verified" : false
		});
    });
    writestream.on('error', function (err) {
    	console.log(err);
    });
	fs.createReadStream(req.file.path)
    	.on('end', function() {
    	fs.unlink(req.file.path);
    	res.send('OK');
  	})
  	.on('error', function() {
  		res.send('ERR');
 	})
    .pipe(writestream);
});

router.put('/screenshot/:id', function(req, res) {
	var collection = req.db.collection('usercollection');
	
	collection.update({ssId:req.body.ssId}, {$set: {
			"verified" : req.body.verified,
			"qename" : req.body.qename
	}}, function (err, doc) {
		if (err) {
			res.send("failed to update");
		} else {
			res.send("Update successful");
		}
	});

});

router.get('/screenshot', function(req, res) {
	var params = {type: "screenshot"};
	var collection = req.db.collection('usercollection');
	var options = {
		"limit": 8,
		"skip": (req.query.batch-1)*8,
		"sort": "_id"
	}
	if (req.query.verified == "false") {
		params["verified"] = false;
	}
	
	if (req.query.release && !(req.query.release=="All Releases")) {
		params["release"] = req.query.release;
	}
	
	if (req.query.page && !(req.query.page=="All Pages")) {
		params["page"] = req.query.page;
	}
	
	if (req.query.classname && !(req.query.classname=="All Categories")) {
		params["classname"] = req.query.classname;
	}
	
	if (req.query.testname && !(req.query.testname=="All Tests")) {
		params["testname"] = req.query.testname;
	}
    
    collection.find(params, options).toArray(function(err, screenshots) {
    	res.send(screenshots);
    });
});

router.get('/screenshot/:id', function(req, res) {
	var collection = req.db.collection('usercollection');
    collection.findOne({ssId: req.params.id}, function(err, screenshot) {
    	res.send(screenshot);
    });
});

router.get('/screenshot/:id/download', function(req, res) {
	var gfs = Grid(req.db, mongo);
	res.set('Content-Type', 'image/jpeg');
    gfs.createReadStream({ _id:req.params.id}).pipe(res);
});


router.get('/releases', function(req, res) {
	var collection = req.db.collection('usercollection');
	var verified = req.query.verified;
	var releases = [];
	var filter = {};
	
	if (!verified || verified == "false") {
		filter["verified"]=false;
	}
	
	releases.push({'value': 'All Releases'});
	collection.distinct('release', filter, function(err, docs) {
		docs.forEach(function(doc) {
			releases.push({'value':doc});
		});
		res.send(releases);
	});
});

router.get('/pages', function(req, res) {
	var release = req.query.release;
	var classname = req.query.classname;
	var verified = req.query.verified;
	var filter = {};
	
	if (release && !(release=="All Releases")) {
		filter["release"]=release;
	}
		
	if (classname && !(classname=="All Categories")) {
		filter["classname"]=classname;
	}
	
	if (!verified || verified == "false") {
		filter["verified"]=false;
	}

	var classnames = [];
	classnames.push({'value': 'All Pages'});
	var collection = req.db.collection('usercollection');
	collection.distinct('page', filter, function(err, docs) {
		docs.forEach(function(doc) {
			classnames.push({'value':doc});
		});
		res.send(classnames);
	});
});

router.get('/classnames', function(req, res) {
	var release = req.query.release;
	var verified = req.query.verified;
	var page = req.query.page;
	var filter = {};
	
	if (release && !(release=="All Releases")) {
		filter["release"]=release;
	}
	
	if (page && !(page=="All Pages")) {
		filter["page"]=page;
	}
	
	if (!verified || verified == "false") {
		filter["verified"]=false;
	}

	var classnames = [];
	classnames.push({'value': 'All Categories'});
	var collection = req.db.collection('usercollection');
	collection.distinct('classname', filter, function(err, docs) {
		docs.forEach(function(doc) {
			classnames.push({'value':doc});
		});
		res.send(classnames);
	});
});


router.get('/testnames', function(req, res) {
	var release = req.query.release;
	var page = req.query.page;
	var classname = req.query.classname;
	var verified = req.query.verified;
	var filter = {};
		
	if (release && !(release=="All Releases")) {
		filter["release"]=release;
	}
	
	if (page && !(page=="All Pages")) {
		filter["page"]=page;
	}
	
	if (classname && !(classname=="All Categories")) {
		filter["classname"]=classname;
	}
	
	if (!verified || verified == "false") {
		filter["verified"]=false;
	}
	
	var testnames = [];
	testnames.push({'value': 'All Tests'});
	var collection = req.db.collection('usercollection');
	collection.distinct('testname', filter, function(err, docs) {
		docs.forEach(function(doc) {
			testnames.push({'value':doc});
		});
		res.send(testnames);
	});
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
	var collection = req.db.collection('usercollection');
	
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