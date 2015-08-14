var express = require('express');
var router = express.Router();
var mongo = require('mongodb');
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), function (req, res, next) {
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

router.get('/:id', function(req, res) {
	var gfs = Grid(req.db, mongo);
	res.set('Content-Type', 'image/jpeg');
    gfs.createReadStream({ _id:req.params.id}).pipe(res);
});

router.get('/', function(req, res) {
    var collection = req.db.collection('usercollection');
    collection.find({type: "screenshot"}, {sort: {_id: 1}}).toArray(function(err, screenshots) {
       	res.render('screenshots', {title: "QA Screenshots Checker", "screenshots" : screenshots});	
    });
});

module.exports = router;