define(["jquery", "d3"], function ($, d3) {
    "use strict";
    //variables declared and defaults set , each of this can be overridden (typically are) via a method
    var instanceRectHeight = 120;
    var startXPosition = 73;
    var startYPosition = 80;
    var regionRectHeight = 620;
    var regionRectWidth = 610;
    var parentRectWidth = 630;
    var titleLabelLeftPadding = 25;
    var rectStyle = {'opacity':0.90946499999999997,'fill':'#cccbbe','fill-opacity':1,'stroke':'#ea6c00','stroke-width':4.15884066,'stroke-linejoin':'round','stroke-miterlimit':4,
        'stroke-opacity':0.93607309, 'stroke-dasharray': 12.4765228, 'stroke-dashoffset':0 };  //default style
    var label = "Region ";
    var labelUnknown = label + "Unknown";
    var groupClassName = "regionGroup";

    function  my(selection) {
        //generate chart
        selection.each(function(d){


            //select the svg element if it exists
            //otherwise create the svg element for the chart
            var svgExists = d3.select(this).selectAll('svg');

            //if svg element doesn't exist add it
            var startEnter;
            if(svgExists==false){
                startEnter = d3.select(this)
                    .append("svg")
                    .attr("xmlns","http://www.w3.org/2000/svg")
                    //.attr("height", "4500px")
                    .attr("width", "100%") ;
            }
            else{
                startEnter = d3.select(this).selectAll('svg');
            }

            startEnter
                .selectAll("g." + groupClassName)
                .data(d)
                .enter()
                .append("g")
                .attr("class",groupClassName)
                .append("rect")
                .style(rectStyle)
                .attr("width",function(d,i){
                    return regionRectWidth;
                })
                .attr("height",function(d,i){
                    return regionRectHeight;
                })
                .attr("ry",74.146713)
                .attr("rx",74.146721)
                .attr("x",startXPosition)
                .attr("y", startYPosition)
                .attr("id", function(d){
                    if(d.name){
                        return d.name;
                    }
                });

            //Add Text Label to Each Region

            d3.select(this).selectAll("g." + groupClassName)
                .append("text")
                .attr("font-size","12px")
                .attr("font-weight","bold")
                .attr("x", function(d,i){
                    return startXPosition + titleLabelLeftPadding;
                })
                .attr("y", function(d,i){
                    var posTextY = startYPosition - 10;
                    return posTextY;

                })
                .attr("id", function(d){
                    if(d.name){
                        return "label" + d.name;
                    }
                })
                .text(function(d){
                    if(d.name){
                        return label + " " + d.name.toUpperCase();
                    }
                    else{
                        return labelUnknown;
                    }
                });

        });
    };


    my.rectStyle = function(value){
        if(!arguments.length) return rectStyle;
        rectStyle = value;
        return my;
    }

    my.instanceRectHeight = function(value){
        if(!arguments.length) return instanceRectHeight;
        instanceRectHeight = value;
        return my;
    }

    my.startXPosition = function(value){
        if(!arguments.length) return startXPosition;
        startXPosition = value;
        return my;
    }

    my.startYPosition = function(value){
        if(!arguments.length) return startYPosition;
        startYPosition = value;
        return my;
    }

    my.regionRectWidth = function(value){
        if(!arguments.length) return regionRectWidth;
        regionRectWidth = value;
        return my;
    }

    my.regionRectHeight = function(value){
        if(!arguments.length) return regionRectHeight;
        regionRectHeight = value;
        return my;
    }

    my.parentRectWidth = function(value){
        if(!arguments.length) return parentRectWidth;
        parentRectWidth = value;
        return my;
    }

    my.groupClassName = function(value){
        if(!arguments.length) return groupClassName;
        groupClassName = value;
        return my;
    }

    my.label = function(value){
        if(!arguments.length) return label;
        label = value;
        return my;
    }

    my.labelUnknown = function(value){
        if(!arguments.length) return labelUnknown;
        labelUnknown = value;
        return my;
    }

    my.titleLabelLeftPadding =  function(value){
        if(!arguments.length) return titleLabelLeftPadding;
        titleLabelLeftPadding = value;
        return my;
    }

    return my;


});
