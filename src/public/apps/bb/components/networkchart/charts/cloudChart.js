define(["jquery", "d3"], function ($, d3) {
    "use strict";
    //variables declared and defaults set , each of this can be overridden (typically are) via a method
    var startXPosition = 73;
    var startYPosition = 80;
    var labelUnknown =  "Unknown";
    var titleLabelLeftPadding = 25;
    var cloudClassName = "regionGroup";


    function  my(selection) {

        selection.each(function(d){
            //select the svg element if it exists
            //otherwise create the svg element for the chart
            var svgExists = d3.select(this).selectAll("svg");

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
                startEnter = d3.select(this).selectAll("svg");
            }

            startEnter
                .selectAll("g." + cloudClassName)
                .data(d)
                .enter()
                .append("g")
                .attr("class",cloudClassName);

            var groupSection =    d3.select(this).selectAll("g." + cloudClassName);

            //add paths to create Cloud Shape
            //#1
            groupSection.append("path")
                .attr("d","m 82.857145,62.362183 a 24.285715,23.571428 0 1 1 -48.57143,0 24.285715,23.571428 0 1 1 48.57143,0 z")
                .attr("ry","23.571428")
                .attr("rx","24.285715")
                .attr("cy","62.362183")
                .attr("cx","58.57143")
                .attr("transform", function(d){ return "translate(37.857144,0.71428568)" })
                .style({'fill':'#f68d00','fill-opacity':0.99543379,'stroke':'none'})
                .attr("id","path3915");
            //#2
            groupSection.append("path")
                .attr("d","m 82.857145,62.362183 a 24.285715,23.571428 0 1 1 -48.57143,0 24.285715,23.571428 0 1 1 48.57143,0 z")
                .attr("ry","23.571428")
                .attr("rx","24.285715")
                .attr("cy","62.362183")
                .attr("cx","58.57143")
                .attr("transform", function(d){ return "translate(53.571429,-16.428572)" })
                .style({'fill':'#f68d00','fill-opacity':0.99543379,'stroke':'none'})
                .attr("id","path3935");

            //#3
            groupSection.append("path")
                .attr("d","m 82.857145,62.362183 a 24.285715,23.571428 0 1 1 -48.57143,0 24.285715,23.571428 0 1 1 48.57143,0 z")
                .attr("ry","23.571428")
                .attr("rx","24.285715")
                .attr("cy","62.362183")
                .attr("cx","58.57143")
                .attr("transform", function(d){ return "translate(70.714287,2.857143)" })
                .style({'fill':'#f68d00','fill-opacity':0.99543379,'stroke':'none'})
                .attr("id","path3937");

            //#4
            groupSection.append("path")
                .attr("d","m 82.857145,62.362183 a 24.285715,23.571428 0 1 1 -48.57143,0 24.285715,23.571428 0 1 1 48.57143,0 z")
                .attr("ry","23.571428")
                .attr("rx","24.285715")
                .attr("cy","62.362183")
                .attr("cx","58.57143")
                .attr("transform", function(d){ return "translate(90.000001,-20)" })
                .style({'fill':'#f68d00','fill-opacity':0.99543379,'stroke':'none'})
                .attr("id","path3939");

            //#5
            groupSection.append("path")
                .attr("d","m 82.857145,62.362183 a 24.285715,23.571428 0 1 1 -48.57143,0 24.285715,23.571428 0 1 1 48.57143,0 z")
                .attr("ry","23.571428")
                .attr("rx","24.285715")
                .attr("cy","62.362183")
                .attr("cx","58.57143")
                .attr("transform", function(d){ return "translate(104.28572,2.1428572)" })
                .style({'fill':'#f68d00','fill-opacity':0.99543379,'stroke':'none'})
                .attr("id","path3941");

            //Add Text Label

            groupSection
                .append("text")
                .attr("font-size","12px")
                .attr("font-family","Verdana")
                .attr("font-weight","bold")
                .attr("x", function(d,i){
                    return startXPosition + titleLabelLeftPadding;
                })
                .attr("y", function(d,i){
                    var posTextY = startYPosition + 10;
                    return posTextY;

                })
                .attr("id", function(d){
                    if(d.name){
                        return "label" + d.name;
                    }
                })
                .text(function(d){
                    if(d.name){
                        return  d.name.toUpperCase();
                    }
                    else{
                        return labelUnknown;
                    }
                });

        });
    };

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

    my.cloudClassName = function(value){
        if(!arguments.length) return cloudClassName;
        cloudClassName = value;
        return my;
    }

    my.titleLabelLeftPadding =  function(value){
        if(!arguments.length) return titleLabelLeftPadding;
        titleLabelLeftPadding = value;
        return my;
    }

    return my;


});
