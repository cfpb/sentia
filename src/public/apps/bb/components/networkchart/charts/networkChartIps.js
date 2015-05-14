define(["jquery", "d3"], function ($, d3) {
    "use strict";
    var NetworkChartIps = function() {
        var startXPosition = 0;
        var startYPosition = 0;
        var regionRectHeight = 0;
        var regionRectWidth = 0;
        var groupClassName = "";
        var numberOfGroups = 0;
        var popoverLabel ="";
        var rectStyle = {'opacity': 0.90946499999999997, 'fill': '#FFCC00', 'fill-opacity': 1};  //default style

        function my(selection) {
            //generate chart
            selection.each(function (d) {


                //select the svg element if it exists
                //otherwise create the svg element for the chart
                var svgExists = d3.select(this).selectAll('svg');

                //if svg element doesn't exist add it
                var startEnter;
                if (svgExists == false) {
                    startEnter = d3.select(this)
                        .append("svg")
                        .attr("xmlns", "http://www.w3.org/2000/svg")
                        .attr("width", "100%");
                }
                else {
                    startEnter = d3.select(this).selectAll('svg');
                }

                startEnter.append("g")
                    .attr("class", groupClassName)
                    .append("rect")
                    .style(rectStyle)
                    .attr("width", function (d, i) {
                        return regionRectWidth;
                    })
                    .attr("height", function (d, i) {
                        return regionRectHeight * numberOfGroups;
                    })
                    .attr("ry", 74.146713)
                    .attr("rx", 74.146721)
                    .attr("x", startXPosition)
                    .attr("y", startYPosition)
                    .attr("id", function (d) {
                        return groupClassName;
                    });


                var textXPosition = startXPosition + 80;
                var textYPosition = startYPosition + 15;

                var securityTextGroup = d3.select(this).select("g." + groupClassName);


                //private ips nested within another array privateIpAddresses array
                _.each(d,function(element,index,list){

                    var textSection = securityTextGroup.selectAll('text.' + groupClassName + "Text")
                        .data(d)
                        .enter()
                        .append("text")
                        .text(function(d){
                            if(popoverLabel){
                                return popoverLabel;
                            }
                            else{
                                return "";
                            }
                        })
                        .attr("class",function (d, i){
                            return groupClassName + "Text";
                        })
                        .attr("text-anchor", "middle")
                        .attr("text-decoration","underline")
                        .each(function (d, i) {

                            //set x, y attribute
                            d3.select(this).attr({
                                x: textXPosition,
                                y: textYPosition
                            })
                            textYPosition += element.privateIpAddresses.length * 26;
                        });


                    _.each(element.privateIpAddresses, function(innerElement, innerIndex, innerList) {
                        //private ip
                        textSection.append("tspan")
                            .attr("x", function (d) {
                                return this.parentElement.attributes.x.value;
                            })
                            .attr("dy", "10")
                            .attr("text-decoration", "none")
                            .text(function (d) {
                                if (innerElement.privateIpAddress) {
                                    return  "Private Ip: " + innerElement.privateIpAddress;
                                }
                                else {
                                    return "Private Ip: " + " unknown";
                                }
                            });

                        //public ip
                        textSection.append("tspan")
                            .attr("x", function (d) {
                                return this.parentElement.attributes.x.value;
                            })
                            .attr("dy", "10")
                            .attr("text-decoration", "none")
                            .text(function (d) {
                                if (innerElement.association) {
                                    if(innerElement.association.publicIp){
                                     return  "Public Ip: " + innerElement.association.publicIp;
                                    }
                                    else{
                                        return "Public Ip: " + " unknown";
                                    }
                                }
                                else {
                                    return "Public Ip: " + " unknown";
                                }
                            });


                    });
                });



            });

        };

        my.startXPosition = function (value) {
            if (!arguments.length) return startXPosition;
            startXPosition = value;
            return my;
        }

        my.startYPosition = function (value) {
            if (!arguments.length) return startYPosition;
            startYPosition = value;
            return my;
        }

        my.regionRectHeight = function (value) {
            if (!arguments.length) return regionRectHeight;
            regionRectHeight = value;
            return my;
        }

        my.regionRectWidth = function (value) {
            if (!arguments.length) return regionRectWidth;
            regionRectWidth = value;
            return my;
        }

        my.groupClassName = function (value) {
            if (!arguments.length) return groupClassName;
            groupClassName = value;
            return my;
        }

        my.numberOfGroups = function (value) {
            if(!arguments.length) return numberOfGroups;
            numberOfGroups = value;
            return my;
        }

        my.rectStyle = function (value) {
            if (!arguments.length) return rectStyle;
            rectStyle = value;
            return my;
        }

        my.popoverLabel = function (value) {
            if (!arguments.length) return popoverLabel;
            popoverLabel = value;
            return my;
        }

        my.selectionData = function (value) {
            if (!arguments.length) return selectionData;
            selectionData = value;
            return my;
        }

        return my;
    }
    return NetworkChartIps;
});
