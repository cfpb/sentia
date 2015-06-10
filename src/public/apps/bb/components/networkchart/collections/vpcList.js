define(['jquery','underscore','backbone','components/networkchart/models/vpc'],function($, _, Backbone, Vpc){

    var vpcList = Backbone.Collection.extend({
        model: Vpc
    });

    return vpcList;

});
