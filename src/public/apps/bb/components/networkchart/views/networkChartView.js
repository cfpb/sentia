define(['jquery','underscore','app','d3','components/networkchart/charts/cloudChart','components/networkchart/charts/networkChartRegions','components/networkchart/charts/networkChartInstances',
     'components/networkchart/charts/networkChartSecurityGroup',   'components/networkchart/models/vpc',
    'components/networkchart/models/subnet','components/networkchart/models/instance', 'components/networkchart/collections/vpcList', 'components/networkchart/collections/instanceList','backbone','layoutmanager'],
    function ($, _, app, d3, cloudChart, networkChartRegions, NetworkChartInstances, NetworkChartSecurityGroup, Vpc, Subnet, Instance, VpcList, InstanceList, Backbone) {
    "use strict";

    var networkChartView = Backbone.Layout.extend({
        tagName: 'div',
        template: 'networkchart/networkChart',
        initialize: function (options) {

          this.regionList = options.regionList;
          this.availabilityZoneList = options.availabilityZoneList;
          this.vpcList = options.vpcList;
          this.subnetList = options.subnetList;
          this.instanceList = options.instanceList;

        },
        regionList: null,
        availabilityZoneList: null,
        vpcList: null,
        subnetList: null,
        instanceList: null,
        afterRender: function () {
            console.log("networkChartView afterRender called");
            console.log("this.regionList: " + JSON.stringify(this.regionList));
            var heading = [{name: 'AWS'}];
            var awsCloudChartStartXPosition = 53;
            var awsCloudChartStartYPosition = 40;
            var awsCloudTitleLeftPadding = 60;
            var awsInstanceRectHeight = 120;
            var awsInstanceRectWidth = 200;
            var regionParentWidth = 630;
            var numColumns = 2;
            var rectTopPadding = 30;
            var rectBottomPadding = 30;
            var rectLeftPadding = 30;



            var awsCloudChartHeading = cloudChart
                .startXPosition(awsCloudChartStartXPosition)
                .startYPosition(awsCloudChartStartYPosition)
                .titleLabelLeftPadding(awsCloudTitleLeftPadding)
                .cloudClassName('cloudAws');

            d3.select("#networkchart")
                .datum(heading)
                .call(awsCloudChartHeading);

            var regionList = {};
            if(this.regionList !== null){
                regionList = this.regionList;
            }

            var instanceList = {};
            if(this.instanceList !== null){
                instanceList = this.instanceList;
            }

            var availabilityZoneCollection = {};

            if(this.availabilityZoneList !== null){
                availabilityZoneCollection = this.availabilityZoneList;
            }

            var vpcCollection = {};
            if(this.vpcList !== null){
                vpcCollection = this.vpcList;
            }

            var instanceCollection = {};
            if(this.instanceList !== null){
                instanceCollection= this.instanceList;
            }

            var availZones = {};
            if(this.availabilityZoneList.models !== undefined){
                availZones = this.availabilityZoneList.models;
            }

            var vpcList = {};

            if(this.vpcList.models !== undefined ){
                vpcList =  this.vpcList.models;
            }

            var regionAreas = {};
            if(this.regionList.models !== undefined){
                regionAreas =  this.regionList.models;
            }


            regionAreas.forEach(function(regionArea, index, array){
                if(regionArea.get("numberOfInstances") > 0){
                    //d3 works with data arrays
                    var itemArrayJson = regionArea.toJSON();
                    var itemArrayJsonfied = [itemArrayJson];
                    var regionAreaTopBottomPadding = regionArea.get("numberOfInstances")  * 120;
                    var regionAreaStartXPosition =  awsCloudChartStartXPosition + 20;
                    var regionAreaStartYPosition = 0;
                    var regionAreaHeight = 0;
                    var regionAreaWidth = 0;
                    //height calculation
                    //get list of availZones with instances
                    //loop thru and aggregate total availZones height
                    var populatedAvailZones = availabilityZoneCollection.filter(function(availZone){
                       return availZone.get("numberOfInstances") > 0 && availZone.get("regionName") === regionArea.get("name");

                    });

                    populatedAvailZones.forEach(function(availZone, index, array){
                        regionAreaHeight = regionAreaHeight + ((awsInstanceRectHeight * availZone.get("numberOfInstances")/numColumns))+ (rectTopPadding * 6) + (rectBottomPadding * 6);
                    });

                    regionAreaWidth = regionParentWidth - 20;

                    if(index === 0){
                        regionAreaStartYPosition =  awsCloudChartStartYPosition + 75 + rectTopPadding;
                    }
                    else{
                        regionAreaStartYPosition =  awsCloudChartStartYPosition + 75 + (awsInstanceRectHeight * array[index-1].get("numberOfInstances"))/2 + rectTopPadding;
                    }

                    //store region rect dimensions for later use
                    regionArea.set("x",regionAreaStartXPosition);
                    regionArea.set("y", regionAreaStartYPosition);
                    regionArea.set("height",regionAreaHeight);
                    regionArea.set("width", regionAreaWidth);

                    var awsRegionsChart = networkChartRegions
                    .startXPosition(regionAreaStartXPosition)
                    .startYPosition(regionAreaStartYPosition)
                    .regionRectHeight(regionAreaHeight)
                    .regionRectWidth(regionAreaWidth)
                    .instanceRectHeight(awsInstanceRectHeight)
                    .rectStyle({'opacity':0.90946499999999997,'fill':'#cccbbe','fill-opacity':1,'stroke':'#ea6c00','stroke-width':4.15884066,'stroke-linejoin':'round','stroke-miterlimit':4,
                        'stroke-opacity':0.93607309, 'stroke-dasharray': 12.4765228, 'stroke-dashoffset':0 })
                    .groupClassName("regionGroup")
                    .labelUnknown("Region Unknown")
                    .label("Region");


                    d3.select("body")
                    .datum(itemArrayJsonfied)
                    .call(awsRegionsChart);
                }
            });


            var prevAvailZoneRectHeight = 0;
            var prevAvailZoneY = 0;
            var counter = 0;
            availZones.forEach(function(availZone, index, array){
                if(availZone.get("numberOfInstances") > 0){
                    var itemArrayJson = availZone.toJSON();
                    var itemArrayJsonfied = [itemArrayJson];
                    var availZoneAreaStartXPosition = 0;
                    var availZoneAreaStartYPosition = 0;
                    var availZoneAreaHeight = 0;
                    var availZoneAreaWidth = 0;
                    var availZonesTopBottomPadding = 100;
                    var region = regionList.findWhere({name: availZone.get("regionName")});
                    var parentRectWidth = region.get("width");

                    if(counter === 0){
                            availZoneAreaStartYPosition = region.get("y") + rectTopPadding;
                    }
                    else {
                            availZoneAreaStartYPosition = prevAvailZoneY + prevAvailZoneRectHeight + rectTopPadding;
                    }

                    var populatedVpcs = new VpcList();

                    var instList = new InstanceList();

                    vpcCollection.forEach(function(vpc, index, array){
                        if(vpc.get("numberOfInstances") > 0){
                            //store instances assoc. with vpc in order to calculate height of vpc rectangle
                            instanceList.forEach(function(instance){
                                //if instance in the availableZone and in this vpc, then add it to instList
                                var instancePlacement = instance.get("placement");
                                if( instancePlacement.availabilityZone === availZone.get("name") &&  instance.get("vpcId") === vpc.get("vpcId")){
                                    //store
                                    instList.add(instance);
                                }
                            });
                            vpc.set("instanceList",instList);
                            populatedVpcs.add(vpc);
                        }
                    });

                    populatedVpcs.forEach(function(vpc, index, array){

                      if(vpc.get("instanceList").length > numColumns){
                         availZoneAreaHeight = availZoneAreaHeight + (awsInstanceRectHeight * Math.ceil(vpc.get("instanceList").length/numColumns) ) + availZonesTopBottomPadding + (3 * rectTopPadding) + (3 * rectBottomPadding);
                        }
                      else{
                          availZoneAreaHeight = availZoneAreaHeight + awsInstanceRectHeight + availZonesTopBottomPadding + (3 * rectTopPadding) + (3 * rectBottomPadding);
                      }
                    });

                    availZoneAreaStartXPosition = region.get("x") + 10;
                    availZoneAreaWidth = region.get("width") - 20;

                    //store region rect dimensions for later use
                    availZone.set("x",availZoneAreaStartXPosition);
                    availZone.set("y", availZoneAreaStartYPosition);
                    availZone.set("height",availZoneAreaHeight);
                    availZone.set("width", availZoneAreaWidth);

                    var awsAvailZonesChart = networkChartRegions
                            .startXPosition(availZoneAreaStartXPosition)
                            .startYPosition(availZoneAreaStartYPosition)
                            .regionRectHeight(availZoneAreaHeight)
                            .regionRectWidth(availZoneAreaWidth)
                            .instanceRectHeight(awsInstanceRectHeight)
                            .rectStyle({'opacity':0.90946499999999997,'fill':'#cccbbe','fill-opacity':1,'stroke':'#eaab00','stroke-width':2.70983338000000007,'stroke-opacity':1})
                            .groupClassName("availZoneGroup"  + index.toString())
                            .labelUnknown("Avail. Zone Unknown")
                            .label("Avail. Zone")
                            .titleLabelLeftPadding(25)
                            .parentRectWidth(parentRectWidth);

                        d3.select("body")
                            .datum(itemArrayJsonfied)
                            .call(awsAvailZonesChart);

                    prevAvailZoneRectHeight =  availZoneAreaHeight;
                    prevAvailZoneY =  availZoneAreaStartYPosition;
                    counter++;
                }
            });

            console.log("networkChartView vpc collection: " + JSON.stringify(this.vpcList));

            var prevVpcStartYPosition=0;


            var counterVpc=0;
            vpcList.forEach(function(vpc, index, array){
                   if(vpc.get("numberOfInstances") > 0){
                  //determine availZone which contains this vpc
                   instanceList.forEach(function(instance){
                        if(instance.get("vpcId") === vpc.get("vpcId")){
                            var placement = instance.get("placement");
                            vpc.set("availabilityZone",placement.availabilityZone);
                        }
                    });

                    if(vpc.get("availabilityZone") !== undefined){
                        var availZone = availabilityZoneCollection.findWhere({zoneName: vpc.get("availabilityZone")});
                        var vpcStartXPosition = 0;
                        var vpcStartYPosition = 0;
                        var vpcHeight = 0;
                        var vpcWidth = 0;
                        var vpcTopBottomPadding = 30;
                        var parentRectWidth = availZone.get("width");

                        //d3 works with data arrays
                        var itemArrayJson = vpc.toJSON();
                        var itemArrayJsonfied = [itemArrayJson];


                        vpcStartXPosition = availZone.get("x") + 10;
                        if(vpc.get("numberOfInstances" > numColumns)) {
                          vpcHeight = Math.ceil(vpc.get("numberOfInstances")/numColumns) *  awsInstanceRectHeight +  (2 * rectTopPadding) + (2 * rectBottomPadding);
                        }
                        else{
                            vpcHeight = awsInstanceRectHeight +  (2 * rectTopPadding) + (2 * rectBottomPadding);
                        }

                        vpcWidth = availZone.get("width") - 20;

                        if(counterVpc === 0){
                            vpcStartYPosition = availZone.get("y") + rectTopPadding ;
                        }
                        else{ //calculate how much to move VPC rectangle down based on size of previous VPC rectangle and number of columns used
                            if(array[index-1].get("numberOfInstances") > numColumns){
                                vpcStartYPosition = availZone.get("y") +  rectTopPadding  + Math.ceil(array[index-1].get("numberOfInstances")/numColumns) * awsInstanceRectHeight;
                            }
                            else{
                                vpcStartYPosition = availZone.get("y") +  rectTopPadding  + awsInstanceRectHeight;
                            }
                        }
                        vpcStartXPosition = availZone.get("x") + 10;
                        //store region rect dimensions for later use
                        vpc.set("x",vpcStartXPosition);
                        vpc.set("y", vpcStartYPosition);
                        vpc.set("height",vpcHeight);
                        vpc.set("width", vpcWidth);

                        prevVpcStartYPosition = vpcStartYPosition;

                        var awsVPCsChart = networkChartRegions
                            .startXPosition(vpcStartXPosition)
                            .startYPosition(vpcStartYPosition)
                            .regionRectHeight(vpcHeight)
                            .regionRectWidth(vpcWidth)
                            .instanceRectHeight(awsInstanceRectHeight)
                            .rectStyle({'opacity':0.90946499999999997,'fill':'#cccbbe','fill-opacity':1,'stroke':'#000000','stroke-width':2.70983338000000007 })
                            .groupClassName("vpcGroup" + index.toString())
                            .label("VPC")
                            .labelUnknown("VPC Unknown")
                            .titleLabelLeftPadding(25)
                            .parentRectWidth(parentRectWidth);


                        d3.select("body")
                            .datum(itemArrayJsonfied)
                            .call(awsVPCsChart);

                        counterVpc++;
                        }
                   }

            });

            var vpcCollection = {};
            if(this.vpcList !== null){
                vpcCollection = this.vpcList;
            }
            var subnetList = {};
            if( this.subnetList.models !== undefined ) {
                subnetList = this.subnetList.models;
            }

            var subnetCounter = 0;
            subnetList.forEach(function(subnet, index, array){
                if(subnet.get("numberOfInstances") > 0){
                    var itemArrayJson = subnet.toJSON();
                    var itemArrayJsonfied = [itemArrayJson];
                    var subnetStartXPosition = 0;
                    var subnetStartYPosition = 0;
                    var subnetHeight = 0;
                    var subnetWidth = 0;


                    var vpc = vpcCollection.findWhere({vpcId: subnet.get("vpcId")});
                    var parentRectWidth = vpc.get("width");

                    if(subnet.get("numberOfInstances") > numColumns){
                        subnetHeight = Math.ceil(subnet.get("numberOfInstances")/numColumns) *  awsInstanceRectHeight + rectTopPadding + rectBottomPadding;
                    }
                    else{
                        subnetHeight = awsInstanceRectHeight + rectTopPadding + rectBottomPadding;
                    }

                    subnetWidth = vpc.get("width") - 20;

                    if(subnetCounter === 0){
                        subnetStartYPosition = vpc.get("y") + rectTopPadding;
                    }
                    else {
                        if(array[index-1].get("numberOfInstances") > numColumns) {
                           subnetStartYPosition = vpc.get("y") + Math.ceil(array[index-1].get("numberOfInstances")/numColumns) * awsInstanceRectHeight + rectTopPadding ;
                        }
                        else{
                            subnetStartYPosition = vpc.get("y") + awsInstanceRectHeight + rectTopPadding;
                        }
                    }

                    subnetStartXPosition = vpc.get("x") + 10;
                    //store region rect dimensions for later use
                    subnet.set("x",subnetStartXPosition);
                    subnet.set("y", subnetStartYPosition);
                    subnet.set("height",subnetHeight);
                    subnet.set("width", subnetWidth);

                    var awsSubnetChart = networkChartRegions
                        .startXPosition(subnetStartXPosition)
                        .startYPosition(subnetStartYPosition)
                        .regionRectHeight(subnetHeight)
                        .regionRectWidth(subnetWidth)
                        .instanceRectHeight(awsInstanceRectHeight)
                        .rectStyle({'opacity':0.90946499999999997,'fill':'#cccbbe','fill-opacity':1,'stroke':'#1100ed','stroke-width':2.70983338000000007,'stroke-linejoin':'round','stroke-dasharray': 12.4765228, 'stroke-dashoffset':0})
                        .groupClassName("subnetGroup")
                        .label("Subnet")
                        .labelUnknown("Subnet Unknown")
                        .titleLabelLeftPadding(35)
                        .parentRectWidth(parentRectWidth);

                    d3.select("body")
                        .datum(itemArrayJsonfied)
                        .call(awsSubnetChart);

                    subnetCounter++;

                }
            });



            //For each subnet get instances assoc. with subnet then draw chart
            var subnetCounter=0;
            subnetList.forEach(function(subnet, index, array){
                if(subnet.get("numberOfInstances") > 0){
                    var instanceArray = instanceCollection.where({subnetId: subnet.get("subnetId")});

                   var instanceArrayJson = [];
                   for(var i = 0; i < instanceArray.length; i++){
                       instanceArrayJson.push(instanceArray[i].toJSON());
                   }
                    var instanceStartXPosition = 0;
                    var instanceStartYPosition = 0;
                    var instanceTopBottomPadding = 25;
                    var parentRectWidth =  subnet.get("width");

                    //determine instanceStartXPosition based on the instance subnet's x position
                    instanceStartYPosition = subnet.get("y") + rectTopPadding;
                    instanceStartXPosition = subnet.get("x") + rectLeftPadding;

                    var awsInstancesChart =  new NetworkChartInstances()
                        .startXPosition(instanceStartXPosition)
                        .startYPosition(instanceStartYPosition)
                        .regionRectHeight(awsInstanceRectHeight)
                        .regionRectWidth(awsInstanceRectWidth)
                        .parentRectWidth(parentRectWidth)
                        .groupClassName("instancesRelatedToVpcs" + subnetCounter)
                        .rowPosition(0)
                        .itemsInRow(0)
                        .rectStyle({'opacity':0.90946499999999997,'fill':'#f68d00','fill-opacity':1 })
                        .on("securityGroupHover", function(d,i) {

                            var awsSecurityGroupChart = new NetworkChartSecurityGroup()
                                .startXPosition(instanceStartXPosition)
                                .startYPosition(instanceStartYPosition)
                                .regionRectHeight(awsInstanceRectHeight)
                                .regionRectWidth(awsInstanceRectWidth)
                                .groupClassName("securityGroup_" + d.name);
                            d3.select("body")
                                .datum(d.securityGroups)
                                .call(awsSecurityGroupChart);
                        })
                        .on("securityGroupHoverOut", function(d,i){
                            d3.select("g." + "securityGroup_" + d.name).remove();
                        });

                    d3.select("body")
                        .datum(instanceArrayJson)
                        .call(awsInstancesChart);

                    subnetCounter++;

                }
            });

            //For the case where instances are not associated with a subnet or vpc, add them within associated Avail. Region
            //note : if an instance is associated with vpc , it also associated with a subnet, since vpcs require a subnet
            //In this case , we are checking for when vpcId's are null
            //new


            var instanceNonVpcList = instanceList.filter(function(instance){
                return instance.get("vpcId") === null;

            })

            var counterAvailZoneIndex=0;
            availabilityZoneCollection.forEach(function(availZone){

                if(availZone.get("numberOfInstances") > 0){

                    var instanceArrayJson = [];
                    //get and store assoc. instances that are non-vpc instances within this Avail. Zone  into array
                     instanceNonVpcList.forEach(function(instanceNonVpc){
                         var placement = instanceNonVpc.get("placement");
                         if(placement.availabilityZone == availZone.get("name")){
                                instanceArrayJson.push(instanceNonVpc.toJSON());
                            }
                     });

                     var startXPosition = availZone.get("x") + rectLeftPadding;
                     var startYPosition = availZone.get("y") + rectTopPadding;
                     var parentRectWidth =  availZone.get("width");

                     var nonVpcAwsInstancesChart = new NetworkChartInstances()
                            .startXPosition(startXPosition)
                            .startYPosition(startYPosition)
                            .regionRectHeight(awsInstanceRectHeight)
                            .regionRectWidth(awsInstanceRectWidth)
                            .parentRectWidth(parentRectWidth)
                            .rowPosition(0)
                            .itemsInRow(0)
                            .groupClassName("instancesNotRelatedToVpcs" + counterAvailZoneIndex)
                            .rectStyle({'opacity':0.90946499999999997,'fill':'#f68d00','fill-opacity':1 })
                            .on("securityGroupHover", function(d,i) {
                                 var xPosition = parseFloat(d3.select("#" + d.name).attr("x")) + 15;
                                 var yPosition = parseFloat(d3.select("#" + d.name).attr("y")) + 15;

                                 var awsSecurityGroupChart = new NetworkChartSecurityGroup()
                                     .startXPosition(xPosition)
                                     .startYPosition(yPosition)
                                     .regionRectHeight(awsInstanceRectHeight)
                                     .regionRectWidth(awsInstanceRectWidth)
                                     .groupClassName("securityGroup_" + d.name);
                                 d3.select("body")
                                     .datum(d.securityGroups)
                                     .call(awsSecurityGroupChart);
                             })
                         .on("securityGroupHoverOut", function(d,i){
                             d3.select("g." + "securityGroup_" + d.name).remove();
                         });

                     d3.select("body")
                            .datum(instanceArrayJson)
                            .call(nonVpcAwsInstancesChart);

                    counterAvailZoneIndex++;
                }
            });









        }
    });

    return networkChartView;
});
