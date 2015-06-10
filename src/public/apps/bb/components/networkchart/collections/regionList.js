define(['jquery','underscore','backbone','components/networkchart/models/region'],function($, _, Backbone, Region){
    var regionList = Backbone.Collection.extend({
        model: Region
    });

    return regionList;

});
