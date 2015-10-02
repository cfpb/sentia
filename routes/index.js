var express = require('express');
var router = express.Router();

/* GET home page. */
//new
router.get('/', function(req, res) {
    res.render('homeindex', { title: 'Sentia - Enlightenment for your Environment' });
});

/* Software Discovery feature page (beta) */
//There is dependency here where each instance needs to have
//softwarediscovery python script installed , so it can determine
//what software is installed and store that in elastic search

router.get('/softwarediscovery', function(req, res) {
    res.render('index', { title: 'Sentia - Enlightenment for your Environment' });
});

router.get('/networkchart', function(req, res, next) {
    res.render('networkchartindex', { title: 'Sentia - Enlightenment for your Environment' });
});

module.exports = router;
