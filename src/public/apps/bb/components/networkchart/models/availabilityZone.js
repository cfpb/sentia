define(['jquery','underscore','backbone'], function($, _, Backbone) {
    var availabilityZone = Backbone.Model.extend({
        defaults: function(){
            return {
                name: "",
                numberOfInstances: 0
            }
        },
        parse: function(response){
            if(response.data.zoneName !== undefined){
               response.data.name = response.data.zoneName;
            }
            return response.data;
        }
    });
    return availabilityZone;
});
