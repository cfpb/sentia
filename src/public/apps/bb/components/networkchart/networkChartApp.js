define(["app", "backbone", "d3", "components/networkchart/views/networkChartView","components/networkchart/models/region",
    "components/networkchart/collections/regionList", "components/networkchart/collections/availabilityZoneList","components/networkchart/collections/vpcList"
    ,"components/networkchart/collections/subnetList","components/networkchart/collections/instanceList"],
 function(app, Backbone, d3, NetworkChartView, Region, RegionList, AvailabilityZoneList, VpcList, SubnetList, InstanceList) {
     "use strict";

     var networkChartApp = function() {
         var regionList = new RegionList();
         var availabilityZoneList = new AvailabilityZoneList();
         var vpcList = new VpcList();
         var subnetList = new SubnetList();
         var instanceList = new InstanceList();

         window.json_Callback= function(data){
             console.log("json_Callback called");
         };

         //Edda looks for specific parameter of in url to _callback signify CORS request
         $.ajaxSetup({
             jsonp: "_callback",
             jsonpCallback: "json_Callback"
         });

         //calculate # of regions  , fetch is async , so wait until done then
         //create regionCollection base on querying aws.availabilityZones
         availabilityZoneList.url = "http://localhost:8080/edda/api/v2/aws/availabilityzones;_pp;_meta;";
         $.when(availabilityZoneList.fetch({
                 type: "GET",
                 cache: true,
                 reset: true,
                 remove: false,
                 silent: false,
                 success: function (data, rtnData){
                     //console.log("availZone fetch successful, rtnData: " + JSON.stringify(rtnData))
                 }
             })).done(function(){
                 availabilityZoneList.forEach(function(item){
                     var exists = regionList.findWhere({name: item.get("regionName")});
                     if(exists === undefined){
                         var region = new Region({
                             name: item.get("regionName")
                         });
                         regionList.add(region);
                     }
                 });

                 //Get Instances
                 instanceList.url = "http://localhost:8080/edda/api/v2/view/instances;_pp;_meta;";
                 $.when(instanceList.fetch({
                         type: "GET",
                         cache: true,
                         reset: true,
                         remove: false,
                         silent: false,
                         success: function (data, rtnData){
                             //console.log("instances fetch successful: " + JSON.stringify(rtnData))
                         }
                     })).done(function(){
                         console.log("running determineNumberOfInstancePerArea");
                         console.log("instanceCount: " + instanceList.length);


                         availabilityZoneList.forEach(function(availZone,index, array){
                             var numberOfInstances = 0;
                             instanceList.forEach(function(instance, instanceIndex, instances){
                                 var placement = instance.get("placement");
                                 if(placement.availabilityZone ===availZone.get("zoneName")){
                                     numberOfInstances++;
                                 }
                             });
                             availZone.set("numberOfInstances",numberOfInstances);
                         });

                         //calculate number of instances per Region
                         regionList.forEach(function(region){
                             var numberOfInstancesInRegion = 0;
                             availabilityZoneList.forEach(function(availZone){
                                 if(availZone.get("regionName") === region.get("name")){
                                     numberOfInstancesInRegion++;
                                 }
                             });
                             region.set("numberOfInstances",numberOfInstancesInRegion);
                         });

                        vpcList.url = "http://localhost:8080/edda/api/v2/aws/vpcs;_pp;_meta;";
                         $.when(vpcList.fetch({
                                 type: "GET",
                                 cache: true,
                                 reset: true,
                                 remove: false,
                                 silent: false,
                                 success: function (data, rtnData){
                                     console.log("vpc fetch successful, rtnData: " + JSON.stringify(rtnData));
                                     console.log("vpc fetch successful");
                                 }
                             })).done(function(){
                                 //calculate # of instances per vpc
                                 vpcList.forEach(function(vpc){
                                     var numberOfInstancesInVpc = 0;
                                     instanceList.forEach(function(instance){
                                         if(instance.get("vpcId") === vpc.get("vpcId")){
                                             numberOfInstancesInVpc++;
                                         }
                                     });
                                     vpc.set("numberOfInstances",numberOfInstancesInVpc);
                                 });

                             });

                         subnetList.url = "http://localhost:8080/edda/api/v2/aws/subnets;_pp;_meta;";
                         $.when(subnetList.fetch({
                                 type: "GET",
                                 cache: true,
                                 reset: true,
                                 remove: false,
                                 silent: false,
                                 success: function (data, rtnData){
                                     console.log("subnetList fetch successful, rtnData: " + JSON.stringify(rtnData))
                                 }
                             })).done(function(){
                                 console.log("subnets fetch complete");
                                 subnetList.forEach(function(subnet){
                                     var numberOfInstancesInSubnet = 0;
                                     instanceList.forEach(function(instance){
                                         if(instance.get("subnetId") === subnet.get("subnetId")){
                                             numberOfInstancesInSubnet++;
                                         }
                                     });
                                     subnet.set("numberOfInstances",numberOfInstancesInSubnet);
                                 });

                                 _.extend(vpcList, Backbone.Events);

                                 var networkChartView = new NetworkChartView({ manage: true, regionList: regionList, availabilityZoneList: availabilityZoneList,
                                     vpcList: vpcList, subnetList: subnetList, instanceList: instanceList});

                                 var layoutHome = app.useLayout('networkchart/networkChartLayout', { view:{ "#containerOne" : networkChartView } });
                                 layoutHome.render();

                             });
                     });
             });

     };

     return networkChartApp;
 });
