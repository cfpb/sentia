var fs = require('fs');
var path = require('path');

var async = require('async');
var express = require('express');
var _ = require('underscore');
var router = express.Router();

// load data providers
var providers = {};
fs.readdir(path.join(__dirname, '../providers'), function(err, contents) {
  if (err) throw Error('Unable to load data providers');
  _.each(contents, function(file) {
    var pname = _.first(path.basename(file).split('.'));
    try {
      providers[pname] = require(path.join(__dirname, '../providers', file));
    } catch(e) {
      throw Error('Error while loading data provider \'' + pname + '\': ' + e.toString());
    }  
  });
});

// --------------------------------------------------------------------------------------
// Define API routes

// List of supported API calls
var supported_actions = ['instances']

// Apply API call to ALL providers
router.get('/:action', function(req, res, next) {
  async.map(_.pairs(providers), function(pair, cb) {
    var id = pair[0];
    var provider = pair[1];
    if (supported_actions.indexOf(req.params.action) === -1) return cb('Unsupported API call: ' + req.params.action);
    if (!_.isFunction(provider[req.params.action])) return; // skip if not supported
    provider[req.params.action](req.query, function(err, res) {
      if (err) return cb(err);
      cb(null, _.map(res, function(rec) {return _.assign(rec, {source: id})}));
    });
  }, function(err, result) {
    if (err) return res.status(400).send({error: err});
    var final_result = _.flatten(result, true);
    res.send(final_result);
  });
});

// Apply API call to filtered list of providers
router.get('/:action/:providers', function(req, res, next) {
  async.map(_.pairs(providers), function(pair, cb) {
    var id = pair[0];
    var provider = pair[1];
    if (req.params.providers && req.params.providers.split(',').indexOf(id) === -1) return; // skip if not in filter
    if (supported_actions.indexOf(req.params.action) === -1) return cb('Unsupported API call: ' + req.params.action);
    if (!_.isFunction(provider[req.params.action])) return; // skip if not supported
    provider[req.params.action](req.query, function(err, res) {
      if (err) return cb(err);
      cb(null, _.map(res, function(rec) {return _.assign(rec, {source: id})}));
    });
  }, function(err, result) {
    if (err) return res.status(400).send({error: err});
    var final_result = _.flatten(result, true);
    res.send(final_result);
  });
});

module.exports = router;
