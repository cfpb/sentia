define(['jquery','underscore','backbone','components/networkchart/models/instance'],function($, _, Backbone, Instance){

    var instanceList = Backbone.Collection.extend({
        model: Instance
    });

    return instanceList;

});
