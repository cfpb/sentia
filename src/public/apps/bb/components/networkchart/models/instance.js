define(['jquery','underscore','backbone'], function($, _, Backbone) {
    var instance = Backbone.Model.extend({
        parse: function(response){
            if(response.data.tags !== undefined){
                var tagsCollection = new Backbone.Collection(response.data.tags);
                tagsCollection.forEach( function(item){
                        if(item.get("key")==="Name"){
                            response.data.name = item.get("value");
                        }
                        else{
                            if(response.data.instanceId !== undefined){
                                response.data.name = response.data.instanceId;
                            }
                            else {
                                response.data.name = "Unknown (tag Name not set)";
                            }
                        }
                    }
                );
            }
            return response.data;
        }
    });
    return instance;
});
