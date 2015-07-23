var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    var sheets;
    var links;
    var tools;
    collection.find({type: "regressionsheet"}, {sort: {_id: -1}, limit: 4}, function(err, sheets) {
    	collection.find({type: "link"}, {sort: {_id: -1}}, function(err, links) {
    		collection.find({type: "tool"}, {sort: {_id: -1}}, function(err, tools) {
                res.render('index', { title: 'QA Windows Console', "sheets" : sheets, "links": links, "tools": tools});	
            });
    	});
    });
});

module.exports = router;