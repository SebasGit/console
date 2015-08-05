var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

router.get('/', function(req, res) {
    var collection = req.db.collection('usercollection');
    collection.find({type: "screenshot"}, {sort: {_id: 1}}).toArray(function(err, screenshots) {
       	res.render('screenshots', {title: "QA Screenshots Checker", "screenshots" : screenshots});	
    });
});

module.exports = router;