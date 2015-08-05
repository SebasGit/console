var express = require('express');
var router = express.Router();
var mongo = require('mongodb');

router.get('/', function(req, res) {
    var sheets;
    var links;
    var tools;
    var collection = req.db.collection('usercollection');
    collection.find({type: "regressionsheet"}, {sort: {_id: -1}, limit: 4}).toArray(function(err, sheets) {
    	collection.find({type: "link"}, {sort: {_id: -1}}).toArray(function(err, links) {
    		collection.find({type: "tool"}, {sort: {_id: -1}}).toArray(function(err, tools) {
            	res.render('index', { title: 'QA Windows Console', "sheets" : sheets, "links": links, "tools": tools});	
           	});
    	});
    });
});

module.exports = router;