define(['jquery','underscore','app','d3','components/networkchart/charts/cloudChart','components/networkchart/charts/networkChartRegions','components/networkchart/charts/networkChartInstances',
        'components/networkchart/charts/networkChartPopover',  'components/networkchart/charts/networkChartIps', 'components/networkchart/models/vpc',
        'components/networkchart/models/subnet','components/networkchart/models/instance', 'components/networkchart/collections/vpcList', 'components/networkchart/collections/instanceList','backbone','layoutmanager'],
    function ($, _, app, d3, cloudChart, networkChartRegions, NetworkChartInstances, NetworkChartPopover,
              NetworkChartIps, Vpc, Subnet, Instance, VpcList, InstanceList, Backbone) {
        "use strict";

        var networkChartForNonVpcsView = Backbone.Layout.extend({
            tagName: 'div',
            template: 'networkchart/networkChart',
            initialize: function (options) {

                this.regionList = options.regionList;
                this.availabilityZoneList = options.availabilityZoneList;
                this.subnetList = options.subnetList;
                this.instanceList = options.instanceList;

            },
            //backbone layout manager serialize method, serializes data to handlebars
            serialize: function(){
              if(this.instancesExist()) {
                  return { Message: ""}
              }
                else{
                  return { Message: "Currently No Instances for this Chart."}
              }
            },
            instancesExist: function(){
                var numInstances=0;
                var that = this;

                that.regionList.forEach(function(regionArea, index, array) {
                    numInstances += regionArea.get("numberOfInstances");
                });

                if(numInstances>0){
                    return true;
                }
                else{
                    return false;
                }

            },
            regionList: null,
            availabilityZoneList: null,
            subnetList: null,
            instanceList: null,
            afterRender: function () {
                var heading = [{name: 'AWS'}];
                var awsCloudChartStartXPosition = 53;
                var awsCloudChartStartYPosition = 40;
                var awsCloudTitleLeftPadding = 60;
                var awsInstanceRectHeight = 150;
                var awsInstanceRectWidth = 200;
                var awsSecurityGroupRectHeight = 50;
                var awsIpsRectHeight = 60;
                var awsIpsEc2ClassicRectHeight = 25;
                var awsEbsRectHeight = 100;
                var awsTagsRectHeight = 40;
                var regionParentWidth = 630;
                var numColumns = 2;
                var rectTopPadding = 30;
                var rectBottomPadding = 30;
                var rectLeftPadding = 30;
                var svgHeight = 0;
                var instanceRectTopPadding = 15;

                var awsCloudChartHeading = cloudChart
                    .startXPosition(awsCloudChartStartXPosition)
                    .startYPosition(awsCloudChartStartYPosition)
                    .titleLabelLeftPadding(awsCloudTitleLeftPadding)
                    .cloudClassName('cloudAws');

                d3.select("#networkchart")
                    .datum(heading)
                    .call(awsCloudChartHeading);


                //underscore.js utilizes this, so set current this context to that
                var that = this;


                that.regionList.forEach(function(regionArea, index, array) {
                    if (regionArea.get("numberOfInstances") > 0) {
                        //d3 works with data arrays
                        var itemArrayJson = regionArea.toJSON();
                        var itemArrayJsonfied = [itemArrayJson];
                        var regionAreaTopBottomPadding = regionArea.get("numberOfInstances") * 120;
                        var regionAreaStartXPosition = awsCloudChartStartXPosition + 20;
                        var regionAreaStartYPosition = 0;
                        var regionAreaHeight = 0;
                        var regionAreaWidth = 0;

                        //loop thru and aggregate total availZones height
                        var populatedAvailZones = that.availabilityZoneList.filter(function(availZone){
                            return availZone.get("numberOfInstances") > 0 && availZone.get("regionName") === regionArea.get("name");

                        });
                        populatedAvailZones.forEach(function(availZone, index, array){
                            var numOfRows = Math.ceil(availZone.get("numberOfInstances")/numColumns)
                            regionAreaHeight = regionAreaHeight + (awsInstanceRectHeight * numOfRows)+ (rectTopPadding * numOfRows) + (rectBottomPadding * numOfRows);
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
                if(svgHeight!==0) {
                    $("svg").height(svgHeight);
                }
                else{
                    //no non-VPC instances , set height to display awsCloudChartHeading
                    $("svg").height(300);
                }

                //Create Avail. Zones Section Chart (for non-vpc instances)

                var prevAvailZoneRectHeight = 0;
                var prevAvailZoneY = 0;
                var counter = 0;
                that.availabilityZoneList.forEach(function(availZone, index, array) {
                    if (availZone.get("numberOfInstances") > 0) {
                        var itemArrayJson = availZone.toJSON();
                        var itemArrayJsonfied = [itemArrayJson];
                        var availZoneAreaStartXPosition = 0;
                        var availZoneAreaStartYPosition = 0;
                        var availZoneAreaHeight = 0;
                        var availZoneAreaWidth = 0;
                        var availZonesTopBottomPadding = 100;

                        var region = that.regionList.findWhere({name: availZone.get("regionName")});
                        var parentRectWidth = region.get("width");
                        if (counter === 0) {
                            availZoneAreaStartYPosition = region.get("y") + rectTopPadding;
                        }
                        else {
                            availZoneAreaStartYPosition = prevAvailZoneY + prevAvailZoneRectHeight + rectTopPadding;
                        }
                        if(availZone.get("numberOfInstances") > numColumns) {
                            var numOfRows = Math.ceil(availZone.get("numberOfInstances") / numColumns);
                            availZoneAreaHeight = numOfRows * awsInstanceRectHeight + numOfRows * instanceRectTopPadding
                            + rectTopPadding + rectBottomPadding;
                        }
                        else{
                            availZoneAreaHeight = awsInstanceRectHeight + instanceRectTopPadding + rectTopPadding + rectBottomPadding;
                        }
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

                var instanceNonVpcList = that.instanceList.filter(function(instance){
                    return instance.get("vpcId") === null;

                });

                var counterAvailZoneIndex=0;
                that.availabilityZoneList.forEach(function(availZone){

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
                            .instanceRectHeight(awsInstanceRectHeight)
                            .regionRectWidth(awsInstanceRectWidth)
                            .parentRectWidth(parentRectWidth)
                            .rowPosition(0)
                            .itemsInRow(0)
                            .groupClassName("instancesNotRelatedToVpcs" + counterAvailZoneIndex)
                            .rectStyle({'opacity':0.90946499999999997,'fill':'#f68d00','fill-opacity':1 })
                            .on("securityGroupHover", function (d, i) {
                                var nameSelector = "#" + d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");

                                var xPosition = parseFloat(d3.select(nameSelector).attr("x")) + 15;
                                var yPosition = parseFloat(d3.select(nameSelector).attr("y")) + 15;
                                var selectionData = [ {"selectionLabel": "Group id", "selectionSelector": "groupId" } ,
                                    {"selectionLabel": "Group Name", "selectionSelector": "groupName"} ];

                                var awsSecurityGroupChart = new NetworkChartPopover()
                                    .startXPosition(xPosition)
                                    .startYPosition(yPosition)
                                    .regionRectHeight(awsSecurityGroupRectHeight)
                                    .regionRectWidth(awsInstanceRectWidth)
                                    .textTopPadding(15)
                                    .textLeftPadding(92)
                                    .groupClassName("securityGroup_" + nameCssClass)
                                    .numberOfGroups(d.securityGroups.length)
                                    .popoverLabel("Security Group(s)")
                                    .selectionData(selectionData);

                                d3.select("body")
                                    .datum(d.securityGroups)
                                    .call(awsSecurityGroupChart);
                            })
                            .on("securityGroupHoverOut", function (d, i) {
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                d3.select("g." + "securityGroup_" + nameCssClass).remove();
                            })
                            .on("privateIpsGroupHover", function (d, i){

                                //need to escape out special characters from d.name
                                var nameSelector = "#" + d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                var xPosition = parseFloat(d3.select(nameSelector).attr("x")) + 15;
                                var yPosition = parseFloat(d3.select(nameSelector).attr("y")) + 15;
                                var numberOfGroups =0;
                                //ip information contained within nested array networkInterfaces[].privateIpAddresses[]
                                //calculate numberOfGroups (number of ip info items)
                                _.each(d.networkInterfaces,function(element,index,list){
                                    numberOfGroups += element.privateIpAddresses.length;
                                });

                                var awsIpsChart = new NetworkChartIps()
                                    .startXPosition(xPosition)
                                    .startYPosition(yPosition)
                                    .regionRectHeight(awsIpsRectHeight)
                                    .regionRectWidth(awsInstanceRectWidth)
                                    .groupClassName("privateIps_" + nameCssClass)
                                    .numberOfGroups(numberOfGroups)
                                    .popoverLabel("Ip Info.");


                                d3.select("body")
                                    .datum(d.networkInterfaces)
                                    .call(awsIpsChart);
                            })
                            .on("privateIpsGroupHoverOut", function (d, i){
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                d3.select("g." + "privateIps_" + nameCssClass).remove();
                            })
                            .on("privateIpsEc2ClassicGroupHover", function(d,i){
                                var nameSelector = "#" + d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");

                                var xPosition = parseFloat(d3.select(nameSelector).attr("x")) + 15;
                                var yPosition = parseFloat(d3.select(nameSelector).attr("y")) + 15;

                                var selectionData = [ {"selectionLabel": "Private Ip ", "selectionSelector": "privateIpAddress" } ,
                                    {"selectionLabel": "Public Ip", "selectionSelector": "publicIpAddress"}];

                                var awsIpsEc2ClassicChart = new NetworkChartPopover()
                                    .startXPosition(xPosition)
                                    .startYPosition(yPosition)
                                    .regionRectHeight(awsIpsEc2ClassicRectHeight)
                                    .regionRectWidth(awsInstanceRectWidth)
                                    .textTopPadding(15)
                                    .textLeftPadding(97)
                                    .groupClassName("privateIpsEc2Classic_" + nameCssClass)
                                    .numberOfGroups(selectionData.length)
                                    .popoverLabel("Ec2 Classic Ips")
                                    .selectionData(selectionData);

                                d3.select("body")
                                    .datum([d])
                                    .call(awsIpsEc2ClassicChart);
                            })
                            .on("privateIpsEc2ClassicGroupHoverOut", function(d,i){
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                d3.select("g." + "privateIpsEc2Classic_" + nameCssClass).remove();
                            })
                            .on("ebsHover", function (d, i){
                                var nameSelector = "#" + d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");

                                var xPosition = parseFloat(d3.select(nameSelector).attr("x")) + 15;
                                var yPosition = parseFloat(d3.select(nameSelector).attr("y")) + 15;
                                var selectionData = [ {"selectionLabel": "Device Name ", "selectionSelector": "deviceName" } ,
                                    {"selectionLabel": "Volume Id", "selectionSelector": "ebs.volumeId"},
                                    {"selectionLabel": "Status", "selectionSelector": "ebs.status"},
                                    {"selectionLabel": "Delete on Termination", "selectionSelector": "ebs.deleteOnTermination"},
                                    {"selectionLabel": "Attach Time", "selectionSelector": "ebs.attachTime"}];

                                var awsEbsChart = new NetworkChartPopover()
                                    .startXPosition(xPosition)
                                    .startYPosition(yPosition)
                                    .regionRectHeight(awsEbsRectHeight)
                                    .regionRectWidth(awsInstanceRectWidth)
                                    .textTopPadding(15)
                                    .textLeftPadding(97)
                                    .groupClassName("ebs_" + nameCssClass)
                                    .numberOfGroups(d.blockDeviceMappings.length)
                                    .popoverLabel("Ebs")
                                    .selectionData(selectionData);

                                d3.select("body")
                                    .datum(d.blockDeviceMappings)
                                    .call(awsEbsChart);
                            })
                            .on("ebsHoverOut", function (d, i){
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                d3.select("g." + "ebs_" + nameCssClass).remove();
                            })
                            .on("tagsHover", function (d, i){
                                var nameSelector = "#" + d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");

                                var xPosition = parseFloat(d3.select(nameSelector).attr("x")) + 15;
                                var yPosition = parseFloat(d3.select(nameSelector).attr("y")) + 15;
                                var selectionData = [ {"selectionLabel": "Tag Name ", "selectionSelector": "key" } ,
                                    {"selectionLabel": "Tag Value", "selectionSelector": "value"}];

                                var awsTagChart = new NetworkChartPopover()
                                    .startXPosition(xPosition)
                                    .startYPosition(yPosition)
                                    .regionRectHeight(awsTagsRectHeight)
                                    .regionRectWidth(awsInstanceRectWidth)
                                    .textTopPadding(15)
                                    .textLeftPadding(97)
                                    .groupClassName("tags_" + nameCssClass)
                                    .numberOfGroups(d.tags.length)
                                    .popoverLabel("")
                                    .selectionData(selectionData);

                                d3.select("body")
                                    .datum(d.tags)
                                    .call(awsTagChart);
                            })
                            .on("tagsHoverOut", function (d, i){
                                var nameCssClass = d.name.replace(/(:|\.|\[|\]|,)/g,"");
                                d3.select("g." + "tags_" + nameCssClass).remove();
                            });


                        d3.select("body")
                            .datum(instanceArrayJson)
                            .call(nonVpcAwsInstancesChart);

                        counterAvailZoneIndex++;
                    }
                });

            }
        });

        return networkChartForNonVpcsView;

    });
