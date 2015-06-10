define(['jquery','underscore','backbone','components/networkchart/models/subnet'],function($, _, Backbone, Subnet){

    var subNetList = Backbone.Collection.extend({
        model: Subnet
    });

    return subNetList;

});
