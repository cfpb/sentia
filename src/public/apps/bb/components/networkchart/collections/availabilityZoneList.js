define(['jquery','underscore','backbone','components/networkchart/models/availabilityZone'],function($, _, Backbone, AvailabilityZone){
    var availabilityZoneList = Backbone.Collection.extend({
        model: AvailabilityZone
    });

    return availabilityZoneList;

});
