define(["jquery", "d3"], function ($, d3) {
    "use strict";
    var NetworkChartSecurityGroup = function() {
        var startXPosition = 0;
        var startYPosition = 0;
        var regionRectHeight = 0;
        var regionRectWidth = 0;
        var groupClassName = "securityGroup";
        var rectStyle = {'opacity': 0.90946499999999997, 'fill': '#FFCC00', 'fill-opacity': 1};  //default style

        function my(selection) {

            //enable drag
            var drag = d3.behavior.drag()
                .origin(function (d) {
                    return d;
                })
                .on("drag", dragmove);

            function dragmove(d) {
                var x = d3.mouse(this)[0];
                var y = d3.mouse(this)[1];
                d3.select(this)
                    .attr("x", d.x = x)
                    .attr("y", d.y = y);
            }

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
                        .attr("height", "4500px")
                        .attr("width", "100%");
                }
                else {
                    startEnter = d3.select(this).selectAll('svg');
                }

                startEnter
                    .selectAll("g." + groupClassName)
                    .data(d)
                    .enter()
                    .append("g")
                    .attr("class", groupClassName)
                    .append("rect")
                    .style(rectStyle)
                    .attr("width", function (d, i) {
                        return regionRectWidth;
                    })
                    .attr("height", function (d, i) {
                        return regionRectHeight;
                    })
                    .attr("ry", 74.146713)
                    .attr("rx", 74.146721)
                    .attr("x", startXPosition)
                    .attr("y", startYPosition)
                    .attr("id", function (d) {
                        if (d.groupId) {
                            return d.groupId;
                        }
                    });

                var textXPosition = startXPosition;
                var textYPosition = startYPosition;

                var textSection = d3.select(this).selectAll("g." + groupClassName)
                    .append("text")
                    .text("Security Groups")
                    .attr("text-anchor", "middle")
                    .attr("font-size", "9px")
                    .attr("font-family", "Verdana")
                    .attr("font-weight", "bold")
                    .each(function (d, i) {
                        textXPosition += 70;
                        textYPosition += 30;
                        //set x, y attribute
                        d3.select(this).attr({
                            x: textXPosition,
                            y: textYPosition
                        })
                    });



                textSection.append("tspan")
                    .attr("x", function (d) {
                        return this.parentElement.attributes.x.value;
                    })
                    .attr("dy", "10")
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

        my.rectStyle = function (value) {
            if (!arguments.length) return rectStyle;
            rectStyle = value;
            return my;
        }

        return my;
    }
    return NetworkChartSecurityGroup;
});
