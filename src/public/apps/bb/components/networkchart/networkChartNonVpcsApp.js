define(["app", "backbone", "d3", "components/networkchart/views/networkChartNonVpcsView","components/networkchart/models/region",
        "components/networkchart/models/vpc","components/networkchart/collections/regionList", "components/networkchart/collections/availabilityZoneList","components/networkchart/collections/vpcList"
        ,"components/networkchart/collections/subnetList","components/networkchart/collections/instanceList"],
    function(app, Backbone, d3, NetworkChartNonVpcsView, Region, Vpc, RegionList, AvailabilityZoneList, VpcList, SubnetList, InstanceList) {
        "use strict";

        var networkChartNonVpcsApp = function() {
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
                            //check if in avail. zone and not associated with a Vpc
                            if(placement.availabilityZone ===availZone.get("zoneName") && instance.get("vpcId")===null){
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
                                numberOfInstancesInRegion = numberOfInstancesInRegion + availZone.get("numberOfInstances");
                            }
                        });
                        region.set("numberOfInstances",numberOfInstancesInRegion);
                    });



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
                                //check to see if instance assoc. with subnet and not assoc. to a Vpc
                                if(instance.get("subnetId") === subnet.get("subnetId") && instance.get("vpcId") === null){
                                    numberOfInstancesInSubnet++;
                                }
                            });
                            subnet.set("numberOfInstances",numberOfInstancesInSubnet);
                        });


                        var networkChartNonVpcsView = new NetworkChartNonVpcsView({ manage: true, regionList: regionList, availabilityZoneList: availabilityZoneList,
                             subnetList: subnetList, instanceList: instanceList});

                        var layoutHome = app.useLayout('networkchart/networkChartLayout', { view:{ "#networkchart" : networkChartNonVpcsView } });
                        layoutHome.render();

                    });
                });
            });

        };

        return networkChartNonVpcsApp;
    });

