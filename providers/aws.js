var settings = require("../settings.js");
var request = require("superagent");
var _ = require('underscore');
var hoops = require('hoops');
_.mixin(hoops);

function filterInstanceList(params, instanceList, cb){
    //JSON Stringified format
    var searchProperties = {};
    var newInstanceList = null;
    if(Object.prototype.toString.call(params.filter) === '[object String]') {
        filterProperties = JSON.parse(params.filter);
        //omit providers property
        filterProperties = _.omit(filterProperties,'providers');
        // filter properties
        Object.keys(filterProperties).forEach(function (key) {
            var v = filterProperties[key];
            //one or more values stored in array
            if(typeof v === 'object' && v && v.constructor.name === 'Array') {
                //one or more values to filter on
                v.forEach(function(arrayItem){
                    newInstanceList = instanceList.filter(function(item){
                        if(_.isIn(item,key)) {
                            if (_.getIn(item, key) === arrayItem) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else{
                            return false;
                        }
                    });
                })
            }
            ////one value to filter on
            else if(typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean'){
                newInstanceList = instanceList.filter(function(item){
                    if(_.isIn(item,key)) {
                        if (_.getIn(item, key) === v) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else{
                        return false;
                    }
                });
            }
            else{
                //incorrect filter format
                return cb(new Error('Incorrect filter format.'));
            }
        });

        return cb(null,newInstanceList)
    }
    else{
        //incorrect filter format
        return cb(new Error('Incorrect filter format.'));
    }


};

function additionalFiltersExist(params){
    var filterProperties = {};
    //JSON Stringified format
    if(Object.prototype.toString.call(params.filter) === '[object String]') {
        filterProperties = JSON.parse(params.filter);
        if(Object.keys(filterProperties).length > 1 ){
            //providers filter should always exist, so we should always have at least more than 1 filter property
            return true;
        }
        else{
            return false;
        };
    }
};

function getEddaRequest(requestUrl, params, callback){
    var dataList = null;
    request.get(requestUrl, function(err, res){
        if(err){
            return callback(err);

        }
        if(res.status === 200){
            console.log('successfully got avail. zones');
            dataList = res.body;
            //Filter Result, if Filter includes filters other than just providers
            if(additionalFiltersExist(params)){
                return filterInstanceList(params,dataList,callback);
            }
            else{
                return callback(null, dataList);
            }

        }
        else{
            return callback(null,null);
        }
    });
};
module.exports = {


    instances: function(params, callback) {
         //current capability can filter on things like providers and availabilityZone
        //api/instances?filter={"providers": ["aws", "dummy"] }
        //api/instances?filter={"providers": ["aws"],"data.placement.availabilityZone":["us-east-1a"] }
        //future abilities - add more filtering options
        //TODO deal with filtering on something like properties which themselves have nested arrays with properties embedded within them
        //example: {"data": {"securityGroups" : [ { "class": "x", "groupId": "ssx", "groupName" : "ext_group_a"  }]

        ////Get Instances
        var instanceList = null;
        var instancesUrl = settings.eddaBaseUrl+'/view/instances;_pp;_meta;';
        request.get(instancesUrl, function(err, res){
            if(err){
                return callback(err);

            }
            if(res.status === 200){
                instanceList = res.body;
                //Filter Result, if Filter includes filters other than just providers
                if(additionalFiltersExist(params)){
                    return filterInstanceList(params,instanceList,callback);
                }
                else{
                 return callback(null, instanceList);
                }

            }
            else{
                return callback(null,null);
            }
        });



    },

    availabilityzones: function(params, callback){
        //current capability can filter on things like providers and availabilityZone
        //api/availabilityzones?filter={"providers": ["aws", "dummy"] }
        //api/availabilityzones?filter={"providers": ["aws"],"data.someProperty":["west"] }

        var requestUrl = settings.eddaBaseUrl+'/aws/availabilityzones;_pp;_meta;';
        return getEddaRequest(requestUrl, params, callback);

    },
    vpcs: function(params, callback){

        var requestUrl = settings.eddaBaseUrl+'/aws/vpcs;_pp;_meta;';
        return getEddaRequest(requestUrl, params, callback);

    },
    subnets: function(params, callback){

        var requestUrl = settings.eddaBaseUrl+'/aws/subnets;_pp;_meta;';
        return getEddaRequest(requestUrl, params, callback);

    }


};

