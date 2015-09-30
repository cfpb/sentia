define(["app", "backbone", "d3", "components/networkchart/views/networkChartView","components/networkchart/models/region",
        "components/networkchart/models/vpc","components/networkchart/collections/regionList", "components/networkchart/collections/availabilityZoneList","components/networkchart/collections/vpcList"
    ,"components/networkchart/collections/subnetList","components/networkchart/collections/instanceList"],
 function(app, Backbone, d3, NetworkChartView, Region, Vpc, RegionList, AvailabilityZoneList, VpcList, SubnetList, InstanceList) {
     "use strict";

     var networkChartApp = function() {
         var regionList = new RegionList();
         var availabilityZoneList = new AvailabilityZoneList();
         var vpcList = new VpcList();
         var subnetList = new SubnetList();
         var instanceList = new InstanceList();

         window.json_Callback= function(data){
             //console.log("json_Callback called");
         };

         //Edda looks for specific parameter of in url to _callback signify CORS request
         $.ajaxSetup({
             jsonp: "_callback",
             jsonpCallback: "json_Callback"
         });

         //calculate # of regions  , fetch is async , so wait until done then
         //create regionCollection base on querying aws.availabilityZones
         //generic api
         availabilityZoneList.url = app.api.availabilityZonesUrl;
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
                 //generic api
                 instanceList.url = app.api.instancesUrl;
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

                         availabilityZoneList.forEach(function(availZone,index, array){
                             var numberOfInstances = 0;
                             instanceList.forEach(function(instance, instanceIndex, instances){
                                 var placement = instance.get("placement");
                                 if(placement.availabilityZone ===availZone.get("zoneName")){
                                     //set VpcId in which availZone is within
                                     availZone.set("vpcId",instance.get("vpcId"));
                                     numberOfInstances++;
                                 }
                             });
                             availZone.set("numberOfInstances",numberOfInstances);
                         });

                         //calculate number of instances per Region
                         var vpcsInRegion = new VpcList();
                         regionList.forEach(function(region){
                             var numberOfInstancesInRegion = 0;
                             availabilityZoneList.forEach(function(availZone){
                                 if(availZone.get("regionName") === region.get("name")){
                                     numberOfInstancesInRegion = numberOfInstancesInRegion + availZone.get("numberOfInstances");

                                     var vpcExists = vpcsInRegion.findWhere({vpcId: availZone.get("vpcId")})
                                     if(vpcExists === undefined){
                                         var vpc = new Vpc({ vpcId: availZone.get("vpcId")});
                                         //set vpc name and #instances as well
                                         vpcsInRegion.add(vpc);
                                     }
                                 }
                             });
                             region.set("vpcCollection",vpcsInRegion);
                             region.set("numberOfInstances",numberOfInstancesInRegion);
                         });
                        //generic api
                         vpcList.url = app.api.vpcsUrl;
                         $.when(vpcList.fetch({
                                 type: "GET",
                                 cache: true,
                                 reset: true,
                                 remove: false,
                                 silent: false,
                                 success: function (data, rtnData){
                                     //console.log("vpc fetch successful, rtnData: " + JSON.stringify(rtnData));
                                     //console.log("vpc fetch successful");
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

                                //update regionList with vpc Info
                               regionList.forEach(function(region){
                                   var vpcsAssociated = region.get("vpcCollection");
                                   vpcsAssociated.forEach(function(assocVpc){
                                       var vpcData = vpcList.findWhere({vpcId: assocVpc.get("vpcId")})
                                       if(vpcData!==undefined){
                                           //update region's Vpc Collection
                                           assocVpc.set("name",vpcData.get("name"));
                                           assocVpc.set("numberOfInstances",vpcData.get("numberOfInstances"))
                                       }
                                   });
                                  //var vpcData = vpcList.findWhere({vpcId: region.get})
                               });

                             });
                         //generic api
                         subnetList.url = app.api.subnetsUrl;
                         $.when(subnetList.fetch({
                                 type: "GET",
                                 cache: true,
                                 reset: true,
                                 remove: false,
                                 silent: false,
                                 success: function (data, rtnData){
                                     //console.log("subnetList fetch successful, rtnData: " + JSON.stringify(rtnData))
                                 }
                             })).done(function(){
                                 //console.log("subnets fetch complete");
                                 subnetList.forEach(function(subnet){
                                     var numberOfInstancesInSubnet = 0;
                                     instanceList.forEach(function(instance){
                                         if(instance.get("subnetId") === subnet.get("subnetId")){
                                             numberOfInstancesInSubnet++;
                                         }
                                     });
                                     subnet.set("numberOfInstances",numberOfInstancesInSubnet);
                                 });

                                 var networkChartView = new NetworkChartView({ manage: true, regionList: regionList, availabilityZoneList: availabilityZoneList,
                                     vpcList: vpcList, subnetList: subnetList, instanceList: instanceList});

                                 var layoutHome = app.useLayout('networkchart/networkChartLayout', { view:{ "#networkchart" : networkChartView } });
                                 layoutHome.render();

                             });
                     });
             });

     };

     return networkChartApp;
 });
