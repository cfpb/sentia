var fs = require('fs');
var path = require('path');

var async = require('async');
var express = require('express');
var _ = require('underscore');
var QS = require('qs');
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
var supported_actions = ['instances','availabilityzones','vpcs','subnets'];


//Api Get call for specific list of providers (data sources) or call to All Providers
//A Get Call does not provide/can not provider data in the body
//only a Post or Put can , therefore data is provider in the HTTP query
//In this route, we are can pass Query Parameter of providers
//we can pass a single provider, or an Array of providers, if nothing is passed in query we get All Providers
//Can Currently use JSON format in query string
//Syntax for Stringified JSON
//api/instances?filter={"providers": ["aws", "dummy"] }
//api/instances?filter={"providers": ["aws"],"data.placement.availabilityZone":["us-east-1a"] }
//Potential future enhancement Syntax using array format
//Syntax for array format, see node-querystring (qs) library
//example
// /api/instances?filter[providers][0]=aws
// /api/instances?filter[providers][0]=aws&filter[providers[1]=dummy

router.get('/:action', function(req, res, next) {
    var requestedProviders = null;
   //determine if provider query string provided
    if(req.query.filter !== undefined){
        //this is for future potential enhancement using array formatted Http Query String
        if((Object.prototype.toString.call(req.query.filter) === '[object Object]') && (Object.prototype.toString.call(req.query.filter.providers) === '[object Array]')){
            requestedProviders = req.query.filter.providers;
            async.map(requestedProviders, executeProvider, resultCallback);
        }
        //this is for Json Formatted Http Query String
        else if(Object.prototype.toString.call(req.query.filter) === '[object String]'){
            requestedProviders = JSON.parse(req.query.filter).providers;
            async.map(requestedProviders, executeProvider, resultCallback);
        }
        else{
            //incorrect format
            next(new Error('Incorrect Query String format'));
        }
    }
    else{ //call All providers
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
            res.type('json').send(final_result);
        });

    }

    function executeProvider(providerName, cb){

        if ( providers[providerName] === undefined ){
            cb(new Error('Provider not found')); // skip if not in filter
        }
        else {
            if (supported_actions.indexOf(req.params.action) === -1) {
                cb(new Error('Unsupported API call: ' + req.params.action));
            }
            else {
                var provider = providers[providerName]; //retrieve provider function from providers

                if (!_.isFunction(provider[req.params.action])) {
                    cb(new Error('provider not supported with a function'));
                }
                else {
                    provider[req.params.action](req.query, function (err, res) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            if (res) {
                                var responseArray = _.map(res, function (rec) {
                                    return _.assign(rec, {source: providerName})
                                });

                                cb(null, responseArray);
                            }
                            else {
                                cb(new Error('action failed: ' + req.params.action));
                            }
                        }
                    });
                }
            }
        }


    }

    function resultCallback(error, result){
        console.log('resultCallBack started')
        if (error) {
            next(error); //if we have 2 providers, we can't send res.status(400) twice, have to pass error along
        }
        else {
            var final_result = _.flatten(result, true);
            res.type('json').send(final_result);
        }
    }
});

// Apply API call to one specific provider
router.get('/:action/:providers', function(req, res, next) {

    var requestedProviders = req.params.providers.split(',');

     async.map(requestedProviders, executeProvider, resultCallback);

    function executeProvider(providerName, cb){

        if ( providers[providerName] === undefined ){
            cb(new Error('Provider not found')); // skip if not in filter
        }
        else {
            if (supported_actions.indexOf(req.params.action) === -1) {
                cb(new Error('Unsupported API call: ' + req.params.action));
            }
            else {
                var provider = providers[providerName]; //retrieve provider function from providers

                if (!_.isFunction(provider[req.params.action])) {
                    cb(new Error('provider not supported with a function'));
                }
                else {
                    provider[req.params.action](req.query, function (err, res) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            if (res) {
                                var responseArray = _.map(res, function (rec) {
                                    return _.assign(rec, {source: providerName})
                                });

                                cb(null, responseArray);
                            }
                            else {
                                cb(new Error('action failed: ' + req.params.action));
                            }
                        }
                    });
                }
            }
        }


    }

    function resultCallback(error, result){
        console.log('resultCallBack started')
        if (error) {
            next(error); //if we have 2 providers, we can't send res.status(400) twice, have to pass error along
        }
        else {
            var final_result = _.flatten(result, true);
            res.type('json').send(final_result);
        }
    }

});





module.exports = router;
