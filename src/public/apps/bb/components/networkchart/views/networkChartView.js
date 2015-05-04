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
                //console.log("networkChartView afterRender called");
                //console.log("this.regionList: " + JSON.stringify(this.regionList));
                var heading = [{name: 'AWS'}];
                var awsCloudChartStartXPosition = 53;
                var awsCloudChartStartYPosition = 40;
                var awsCloudTitleLeftPadding = 60;
                var awsInstanceRectHeight = 120;
                var awsInstanceRectWidth = 200;
                var awsSecurityGroupRectHeight = 50;
                var regionParentWidth = 630;
                var numColumns = 2;
                var rectTopPadding = 30;
                var rectBottomPadding = 30;
                var rectLeftPadding = 30;
                var svgHeight = 0;
                var instanceRectTopPadding = 10;
                var instanceRectBottomPadding = 12;
                var subnetRectBottomPadding = 30;
                var vpcRectBottomPadding = 30;


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

                var regionAreasCollection = {};
                if(this.regionList !== null){
                    regionAreasCollection = this.regionList;
                }

                var vpcCollection = {};
                if(this.vpcList !== null){
                    vpcCollection = this.vpcList;
                }
                var subnetList = {};
                if( this.subnetList.models !== undefined ) {
                    subnetList = this.subnetList.models;
                    //limit to subnets with instances
                    subnetList = subnetList.filter(function(subnet){
                        return subnet.get("numberOfInstances") > 0;
                    });
                }

                var populatedVpcs = vpcList.filter(function(vpc){
                    return vpc.get("numberOfInstances") > 0;
                });

                populatedVpcs.forEach(function(vpc, index, array) {
                        var numOfSubnetsInVpc = 0;
                        var subnetListFiltered = subnetList.filter(function (subnet) {
                            return subnet.get("vpcId") === vpc.get("vpcId");
                        });

                     //for each subnet determine # rows in each subnet and tally up total # rows for vpc
                        var numOfRowsInVpc = 0;
                        subnetListFiltered.forEach(function (subnetInVpc, subnetIndex, subnetArray) {
                            var numOfRowsInSubnet = Math.ceil(subnetInVpc.get("numberOfInstances") / numColumns);
                            numOfRowsInVpc = numOfRowsInVpc + numOfRowsInSubnet;
                            numOfSubnetsInVpc++;
                        });
                        vpc.set("numberOfRows", numOfRowsInVpc);
                        vpc.set("numberOfSubnets", numOfSubnetsInVpc);

                });

                regionAreasCollection.forEach(function(regionArea, index, array){
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

                        var regionVpcs = regionArea.get("vpcCollection");


                        populatedVpcs.forEach(function(vpc, index, array){

                            regionAreaHeight = regionAreaHeight + (vpc.get("numberOfRows") * awsInstanceRectHeight) +
                            (vpc.get("numberOfRows") * instanceRectTopPadding) + (vpc.get("numberOfRows") * instanceRectBottomPadding) +
                            (vpc.get("numberOfSubnets") * rectTopPadding) + (vpc.get("numberOfSubnets") * rectBottomPadding) +
                            (vpc.get("numberOfSubnets") * subnetRectBottomPadding) + vpcRectBottomPadding;

                            //total svg height
                            svgHeight = svgHeight + regionAreaHeight;
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
                //Set Svg Height
                $("svg").height(svgHeight);


                var instList = new InstanceList();

                populatedVpcs.forEach(function(vpc, index, array){
                                //store instances assoc. with vpc in order to calculate height of vpc rectangle
                                instanceList.forEach(function(instance){
                                    if(  instance.get("vpcId") === vpc.get("vpcId")){
                                        //store
                                        instList.add(instance);
                                        vpc.set("instanceList",instList);

                                    }
                                });
                });

                //console.log("networkChartView vpc collection: " + JSON.stringify(this.vpcList));

                var counterVpc=0;
                populatedVpcs.forEach(function(vpc, index, array){
                    if(vpc.get("numberOfInstances") > 0){

                        //determine region which contains vpc
                        //this can be determined by instance.placement.availabilityZone
                        var instanceListing = vpc.get("instanceList");
                        var instance = instanceListing.at(0);
                        var placement = instance.get("placement");
                        //note: Vpc can be over multiple Avail. Zones, but not over multiple Regions
                        //Get Avail. Zones used by Vpc
                        var availZonesforVpc = availabilityZoneCollection.where({vpcId: vpc.get("vpcId")});
                        //var availZoneforVpc = availabilityZoneCollection.findWhere({name: placement.availabilityZone});
                        //determine region
                        var availZoneforVpc = availZonesforVpc[0];
                        var regionArea = regionAreasCollection.findWhere( {name: availZoneforVpc.get("regionName")});

                        var vpcStartXPosition = 0;
                        var vpcStartYPosition = 0;
                        var vpcHeight = 0;
                        var vpcWidth = 0;
                        var vpcTopBottomPadding = 160;
                        var parentRectWidth = regionArea.get("width");

                        //d3 works with data arrays
                        var itemArrayJson = vpc.toJSON();
                        var itemArrayJsonfied = [itemArrayJson];

                       //determine number of subnets assoc with vpc
                        var numOfSubnetsInVpc = 0;
                        var subnetListFiltered = subnetList.filter(function(subnet){
                            return subnet.get("vpcId") === vpc.get("vpcId");
                        });

                        //for each subnet determine # rows in each subnet and tally up total # rows for vpc
                        var numOfRowsInVpc = 0;
                        subnetListFiltered.forEach(function(subnetInVpc, subnetIndex, subnetArray){
                            var numOfRowsInSubnet = Math.ceil(subnetInVpc.get("numberOfInstances")/numColumns);
                            numOfRowsInVpc = numOfRowsInVpc + numOfRowsInSubnet;
                            numOfSubnetsInVpc++;
                        });

                        if(vpc.get("numberOfInstances") > numColumns) {
                            vpcHeight = numOfRowsInVpc * awsInstanceRectHeight +  numOfRowsInVpc * instanceRectTopPadding +
                                numOfRowsInVpc * instanceRectBottomPadding + numOfSubnetsInVpc * rectTopPadding
                            + numOfSubnetsInVpc * rectBottomPadding + numOfSubnetsInVpc * subnetRectBottomPadding;
                            }
                        else {
                                vpcHeight = awsInstanceRectHeight +  instanceRectTopPadding + rectTopPadding + rectBottomPadding + subnetRectBottomPadding;
                            }

                        vpcWidth = regionArea.get("width") - 20;

                        if(counterVpc === 0){
                                vpcStartYPosition = regionArea.get("y") + rectTopPadding ;
                            }
                        else{ //calculate how much to move VPC rectangle down based on size of previous VPC rectangle and number of columns used

                            if(array[index-1].get("numberOfInstances") >= numColumns){
                                vpcStartYPosition = array[index-1].get("y") + array[index-1].get("height") + rectTopPadding;
                            }
                            else {
                                    vpcStartYPosition = array[index-1].get("y");
                            }
                        }
                        vpcStartXPosition = regionArea.get("x") + 15;
                        //store region rect dimensions for later use
                        vpc.set("x",vpcStartXPosition);
                        vpc.set("y", vpcStartYPosition);
                        vpc.set("height",vpcHeight);
                        vpc.set("width", vpcWidth);



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

                });



                //Create Subnets Section
                var subnetRectTopPadding = 90;

                vpcCollection.forEach(function(vpc,vpcIndex, vpcArray) {
                    var subnetCounter = 0;
                    //subnets for this Vpc only
                    var subnetListFiltered = subnetList.filter(function(subnet){
                       return subnet.get("vpcId") === vpc.get("vpcId");
                    });


                    subnetListFiltered.forEach(function (subnet, index, array) {
                            var itemArrayJson = subnet.toJSON();
                            var itemArrayJsonfied = [itemArrayJson];
                            var subnetStartXPosition = 0;
                            var subnetStartYPosition = 0;
                            var subnetHeight = 0;
                            var subnetWidth = 0;



                            var parentRectWidth = vpc.get("width");

                            if (subnet.get("numberOfInstances") > numColumns) {
                                var numOfRows = Math.ceil(subnet.get("numberOfInstances") / numColumns);
                                subnetHeight =  numOfRows * awsInstanceRectHeight + numOfRows * instanceRectTopPadding +
                                    numOfRows * instanceRectBottomPadding +
                                rectTopPadding + rectBottomPadding;
                            }
                            else {
                                subnetHeight = awsInstanceRectHeight + rectTopPadding + rectBottomPadding  + instanceRectTopPadding
                                + instanceRectBottomPadding;
                            }

                            subnetWidth = vpc.get("width") - 20;

                            if (subnetCounter === 0) {
                                subnetStartYPosition = vpc.get("y") + rectTopPadding;
                            }
                            else {
                                    subnetStartYPosition = array[index - 1].get("y") + array[index - 1].get("height") + rectTopPadding;
                            }

                            subnetStartXPosition = vpc.get("x") + 10;
                            //store region rect dimensions for later use
                            subnet.set("x", subnetStartXPosition);
                            subnet.set("y", subnetStartYPosition);
                            subnet.set("height", subnetHeight);
                            subnet.set("width", subnetWidth);

                            var awsSubnetChart = networkChartRegions
                                .startXPosition(subnetStartXPosition)
                                .startYPosition(subnetStartYPosition)
                                .regionRectHeight(subnetHeight)
                                .regionRectWidth(subnetWidth)
                                .instanceRectHeight(awsInstanceRectHeight)
                                .rectStyle({
                                    'opacity': 0.90946499999999997,
                                    'fill': '#cccbbe',
                                    'fill-opacity': 1,
                                    'stroke': '#1100ed',
                                    'stroke-width': 2.70983338000000007,
                                    'stroke-linejoin': 'round',
                                    'stroke-dasharray': 12.4765228,
                                    'stroke-dashoffset': 0
                                })
                                .groupClassName("subnetGroup" + subnet.get("subnetId"))
                                .label("Subnet")
                                .labelUnknown("Subnet Unknown")
                                .titleLabelLeftPadding(65)
                                .parentRectWidth(parentRectWidth);

                            d3.select("body")
                                .datum(itemArrayJsonfied)
                                .call(awsSubnetChart);

                            subnetCounter++;


                    });
                });

                //For each subnet get instances assoc. with subnet then draw chart
                var subnetCounter=0;
                subnetList.forEach(function(subnet, index, array) {

                    var instanceArray = instanceCollection.where({subnetId: subnet.get("subnetId")});

                    var instanceArrayJson = [];
                    for (var i = 0; i < instanceArray.length; i++) {
                        instanceArrayJson.push(instanceArray[i].toJSON());
                    }
                    var instanceStartXPosition = 0;
                    var instanceStartYPosition = 0;
                    var instanceTopBottomPadding = 25;
                    var parentRectWidth = subnet.get("width");

                    //determine instanceStartXPosition based on the instance subnet's x position
                    instanceStartYPosition = subnet.get("y") + rectTopPadding;
                    instanceStartXPosition = subnet.get("x") + rectLeftPadding;

                    var awsInstancesChart = new NetworkChartInstances()
                        .startXPosition(instanceStartXPosition)
                        .startYPosition(instanceStartYPosition)
                        .instanceRectHeight(awsInstanceRectHeight)
                        .regionRectWidth(awsInstanceRectWidth)
                        .parentRectWidth(parentRectWidth)
                        .regionRectTopPadding(instanceRectTopPadding)
                        .groupClassName("instancesRelated_" + subnet.get("subnetId"))
                        .rowPosition(0)
                        .itemsInRow(0)
                        .rectStyle({'opacity': 0.90946499999999997, 'fill': '#f68d00', 'fill-opacity': 1})
                        .on("securityGroupHover", function (d, i) {

                            var xPosition = parseFloat(d3.select("#" + d.name).attr("x")) + 15;
                            var yPosition = parseFloat(d3.select("#" + d.name).attr("y")) + 15;

                            var awsSecurityGroupChart = new NetworkChartSecurityGroup()
                                .startXPosition(xPosition)
                                .startYPosition(yPosition)
                                .regionRectHeight(awsSecurityGroupRectHeight)
                                .regionRectWidth(awsInstanceRectWidth)
                                .groupClassName("securityGroup_" + d.name)
                                .numberOfSecurityGroups(d.securityGroups.length);

                            d3.select("body")
                                .datum(d.securityGroups)
                                .call(awsSecurityGroupChart);
                        })
                        .on("securityGroupHoverOut", function (d, i) {
                            d3.select("g." + "securityGroup_" + d.name).remove();
                        });

                    d3.select("body")
                        .datum(instanceArrayJson)
                        .call(awsInstancesChart);

                    subnetCounter++;

                });



            }
        });

        return networkChartView;
    });

