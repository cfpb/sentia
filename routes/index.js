var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Sentia - Enlightenment for your Environment' });
});

router.get('/networkchart', function(req, res, next) {
    res.render('networkchartindex', { title: 'entia - Enlightenment for your Environment' });
});

module.exports = router;
