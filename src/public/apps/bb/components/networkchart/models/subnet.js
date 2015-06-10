define(['jquery','underscore','backbone'], function($, _, Backbone) {
    var subnet = Backbone.Model.extend({
            defaults: function(){
                return {
                    name: "",
                    numberOfInstances: 0
                }
            },
        parse: function(response){
            if(response.data.tags !== undefined){
                var tagsCollection = new Backbone.Collection(response.data.tags);
                tagsCollection.forEach( function(item){
                        if(item.get("key")==="Name"){
                            response.data.name = item.get("value");
                        }
                        else{
                            response.data.name = "Unknown";
                        }
                    }
                );
            }
            return response.data;
        }
    });
    return subnet;
});