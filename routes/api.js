var fs = require('fs');
var path = require('path');

var express = require('express');
var router = express.Router();

// load data providers
var providers = {};
fs.readdir(path.join(__dirname, '../providers'), function(err, file) {
  if (err) throw Error('Unable to load data providers');
  var pname = path.basename(file);
  try {
    providers[path.basename(file)] = 
  } catch(e) {
    throw Error('Error while loading data provider \'' + pname + '\': ' + e.toString());
  }
  
});


// define API routes
router.get('/instances', function(req, res, next) {
    res.send({test:123});
});

// error handler
function api_error(msg) {
  
}

module.exports = router;
