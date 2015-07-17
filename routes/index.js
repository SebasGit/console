var express = require('express');
var router = express.Router();


router.get('/', function(req, res) {
    var db = req.db;
    var collection = db.get('usercollection');
    collection.find({}, {sort: {_id: -1}, limit: 1}, function(err, records) {
        res.render('index', { title: 'QA Windows Console', "records" : records});
    });
});

module.exports = router;