define(["jquery", "d3"], function ($, d3) {
    "use strict";
    var NetworkChartSecurityGroup = function() {
        var startXPosition = 0;
        var startYPosition = 0;
        var regionRectHeight = 0;
        var regionRectWidth = 0;
        var groupClassName = "securityGroup";
        var numberOfSecurityGroups = 0;
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
                        //.attr("height", "4500px")
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
                        return regionRectHeight * numberOfSecurityGroups;
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

                var textSection = securityTextGroup.selectAll('text.' + groupClassName + "Text")
                    .data(d)
                    .enter()
                    .append("text")
                    .text("Security Group:")
                    .attr("class",function (d, i){
                        return groupClassName + "Text";
                    })
                    .attr("text-anchor", "middle")
                    .attr("text-decoration","underline")
                    .attr("font-size", "9px")
                    .attr("font-family", "Verdana")
                    .attr("font-weight", "bold")
                    .each(function (d, i) {

                        //set x, y attribute
                        d3.select(this).attr({
                            x: textXPosition,
                            y: textYPosition
                        })
                        textYPosition += 40;
                    });



                textSection.append("tspan")
                    .attr("x", function (d) {
                        return this.parentElement.attributes.x.value;
                    })
                    .attr("dy", "10")
                    .attr("text-decoration","none")
                    .text(function (d) {
                        if (d.groupId) {
                            return "GroupId: " + d.groupId;
                        }
                        else {
                            return "groupId unknown";
                        }
                    }
                );

                textSection.append("tspan")
                    .attr("x", function (d) {
                        return this.parentElement.attributes.x.value;
                    })
                    .attr("dy", "10")
                    .text(function (d) {
                        if (d.groupName) {
                            return "GroupName: " + d.groupName;
                        }
                        else {
                            return "GroupName unknown";
                        }
                    }
                );

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

        my.numberOfSecurityGroups = function (value) {
            if(!arguments.length) return numberOfSecurityGroups;
            numberOfSecurityGroups = value;
            return my;
        }

        my.rectStyle = function (value) {
            if (!arguments.length) return rectStyle;
            rectStyle = value;
            return my;
        }

        return my;
    }
    return NetworkChartSecurityGroup;
});
