define(["jquery", "d3","moment"], function ($, d3, moment) {
    "use strict";
    var NetworkChartPopOver = function() {
        var startXPosition = 0;
        var startYPosition = 0;
        var regionRectHeight = 0;
        var regionRectWidth = 0;
        var textTopPadding = 0;
        var textLeftPadding = 0;
        var groupClassName = "";
        var numberOfGroups = 0;
        var popoverLabel ="";
        var selectionData = null;
        //example  var selectionData = [ {"selectionLabel": "Group id", "selectionSelector": "groupId" } ,
        //{"selectionLabel": "Group Name", "selectionSelector": "groupName"} ];
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
                        return regionRectHeight * numberOfGroups;
                    })
                    .attr("ry", 74.146713)
                    .attr("rx", 74.146721)
                    .attr("x", startXPosition)
                    .attr("y", startYPosition)
                    .attr("id", function (d) {
                        return groupClassName;
                    });


                var textXPosition = startXPosition + textLeftPadding;
                var textYPosition = startYPosition + textTopPadding;

                var securityTextGroup = d3.select(this).select("g." + groupClassName);

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
                        textYPosition +=  selectionData.length * 15;
                    });


                _.each(selectionData,function(element,index,list){
                    textSection.append("tspan")
                        .attr("x", function (d) {
                            return this.parentElement.attributes.x.value;
                        })
                        .attr("dy", "10")
                        .attr("text-decoration","none")
                        .text(function (d) {
                            if (my.get(d,element.selectionSelector)) {
                                if( my.isValidDate(my.get(d,element.selectionSelector)) === true){
                                    var formattedDate = moment(my.get(d,element.selectionSelector)).format("LLL");
                                    return element.selectionLabel.toString() + ": " + formattedDate;
                                }
                                else{
                                    return element.selectionLabel.toString() + ": " + my.get(d,element.selectionSelector);
                                }

                            }
                            else {
                                return element.selectionLabel.toString() + ": " +" unknown";
                            }
                        }
                    );
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

        my.textLeftPadding = function (value){
            if (!arguments.length) return textLeftPadding;
            textLeftPadding = value;
            return my;
        }

        my.textTopPadding = function (value){
            if (!arguments.length) return textTopPadding;
            textTopPadding = value;
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

        my.get = function(obj, key){
            return key.split(".").reduce(function(o, x){
               return (typeof o == "undefined" || o === null) ? o : o[x];
            }, obj);
        }

        my.isValidDate = function(str){
            var d = moment(str,"D/M/YYYY");
            if(d === null || !d.isValid()){
                return false;
            }

            if( str.indexOf(d.format('D/M/YYYY')) >= 0 || str.indexOf(d.format('DD/MM/YYYY')) >= 0 ||
                str.indexOf(d.format('D/M/YY')) >= 0 || str.indexOf(d.format('DD/MM/YYYY')) >= 0){
                return true
            }
            else{
                return false;
            }
        }

        return my;
    }
    return NetworkChartPopOver;
});
