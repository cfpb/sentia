define(['jquery','underscore','backbone'], function($, _, Backbone) {
    var region = Backbone.Model.extend({
        defaults: function(){
            return {
                name: "",
                numberOfInstances: 0
            }
        },
        parse: function(response){
            return response.data;
        }
    });
    return region;
});
