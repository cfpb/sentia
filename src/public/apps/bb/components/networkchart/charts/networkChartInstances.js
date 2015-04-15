define(["jquery", "d3"], function ($, d3) {
    "use strict";
  var NetworkChartInstances = function() {
      //variables declared and defaults set , each of this can be overridden (typically are) via a method
      var instanceRectHeight = 120;
      var startXPosition = 73.007973;
      var startYPosition = 80;
      var regionRectHeight = 200;
      var regionRectWidth = 250;
      var parentRectWidth = 570;
      var rectStyle = {'opacity': 0.90946499999999997, 'fill': '#f68d00', 'fill-opacity': 1};  //default style
      var groupClassName = "instanceGroup";
      var rowPosition = 0;
      var itemsInRow = 0;
      var newRow = false;
      var dispatch = d3.dispatch("securityGroupHover","securityGroupHoverOut");

      function my(selection) {
          //generate chart

          selection.each(function (d) {
                  //select the svg element if it exists
                  //otherwise create the skeletal chart
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
                      .attr("id", function (d) {
                          if (d.name) {
                              return "group_" + d.name;
                          }
                      })
                      .append("rect")
                      .style(rectStyle)
                      .attr("width", regionRectWidth)
                      .attr("height", function (d, i) {

                          return instanceRectHeight;
                      })
                      .attr("ry", 14.64286)
                      .attr("rx", 16.5751)
                      .each(function (d, i) {
                          //calculate x
                          var finalXPosition = 0;
                          var helper = function (d, i) {
                              if (i === 0) {
                                  return startXPosition;
                              }
                              else {
                                  return startXPosition + (itemsInRow * regionRectWidth) + (itemsInRow * 10);
                              }
                          }

                          var calcX = helper(d, i);

                          //if adding the instance rect in this spot, causes it to be outside of parent rect
                          //then move down to next row
                          if (calcX + regionRectWidth > parentRectWidth) {
                              //move down and set x to be first column  - this is done .attr("y") function
                              //move down by increasing the startYPosition
                              newRow = true;
                              //newRow set ItemsInRow to 1
                              itemsInRow = 1;
                              finalXPosition = startXPosition;
                          }
                          else {
                              newRow = false;
                              itemsInRow = itemsInRow + 1;
                              finalXPosition = calcX;
                          }

                          //calculate y
                          var finalYPosition = 0;
                          if (rowPosition === 0) {             //initial to rowPosition to startYPosition
                              rowPosition = startYPosition;
                          }

                          //if adding the instance rect in this spot, causes it to be outside of parent rect
                          //then move down to next row
                          if (newRow) {
                              rowPosition = rowPosition + instanceRectHeight + 20;
                              finalYPosition = rowPosition;
                          }
                          else {
                              finalYPosition = rowPosition;
                          }

                          //set x, y attribute
                          d3.select(this).attr({
                              x: finalXPosition,
                              y: finalYPosition
                          })

                      })
                      .attr("id", function (d) {
                          if (d.name) {
                              return d.name;
                          }
                      });


                  //Add Text Labels to Each Instance
                  rowPosition = 0;
                  itemsInRow = 0;
                  newRow = false;

                  var labelSection = d3.select(this).selectAll("." + groupClassName)
                      .append("text")
                      .attr("font-size", "9px")
                      .attr("font-family", "Verdana")
                      .attr("font-weight", "bold")
                      .each(function (d, i) {
                          //calculate x
                          var finalXPosition = 0;
                          var helper = function (d, i) {
                              if (i === 0) {
                                  return startXPosition + 40;
                              }
                              else {
                                  return startXPosition + (itemsInRow * regionRectWidth) + (itemsInRow * 40);
                              }
                          }

                          var calcX = helper(d, i);

                          //if adding the instance rect in this spot, causes it to be outside of parent rect
                          //then move down to next row
                          if (calcX + regionRectWidth > parentRectWidth) {
                              //move down and set x to be first column
                              //move down by increasing the startYPosition
                              newRow = true;
                              //newRow set ItemsInRow to 1
                              itemsInRow = 1;
                              finalXPosition = startXPosition + 40;
                          }
                          else {
                              newRow = false;
                              itemsInRow = itemsInRow + 1;
                              finalXPosition = calcX;
                          }

                          //calculate y
                          var finalYPosition = 0;
                          if (rowPosition === 0) {             //initial to rowPosition to startYPosition
                              rowPosition = startYPosition + 25;
                          }

                          //if adding the instance rect in this spot, causes it to be outside of parent rect
                          //then move down to next row
                          if (newRow) {
                              rowPosition = rowPosition + instanceRectHeight + 15;
                              finalYPosition = rowPosition;
                          }
                          else {
                              finalYPosition = rowPosition;
                          }

                          //set x, y attribute
                          d3.select(this).attr({
                              x: finalXPosition,
                              y: finalYPosition
                          })

                      });

                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .text(function (d) {
                          if (d.name) {
                              return "Instance id: " + d.instanceId;
                          }
                          else {
                              return "Instance unknown";
                          }
                      }
                  );

                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text(function (d) {
                          if (d.description) {
                              return "Description: " + d.description;
                          }
                          else {
                              return "Description: ";
                          }
                      });

                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text(function (d) {
                          if (d.privateIp) {
                              return "Private Ip: " + d.privateIp;
                          }
                          else {
                              return "Private Ip: ";
                          }
                      });

                  //security group clickable item
                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text("Security Groups")
                      .attr("text-decoration", "underline")
                      .style("cursor", "pointer")
                      .on("mouseover", dispatch.securityGroupHover)
                      .on("mouseout", dispatch.securityGroupHoverOut);


              }
          );
      }

      my.instanceRectHeight = function (value) {
          if (!arguments.length) return instanceRectHeight;
          instanceRectHeight = value;
          return my;
      }

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

      my.parentRectWidth = function (value) {
          if (!arguments.length) return parentRectWidth;
          parentRectWidth = value;
          return my;
      }

      my.rectStyle = function (value) {
          if (!arguments.length) return rectStyle;
          rectStyle = value;
          return my;
      }

      my.groupClassName = function (value) {
          if (!arguments.length) return groupClassName;
          groupClassName = value;
          return my;
      }


      my.rowPosition = function (value) {
          if (!arguments.length) return rowPosition;
          rowPosition = value;
          return my;
      }

      my.itemsInRow = function (value) {
          if (!arguments.length) return itemsInRow;
          itemsInRow = value;
          return my;
      }

      var xPositionHelper = function (d, i) {
          if (i === 0) {
              return startXPosition;
          }
          else {
              return startXPosition + (i * regionRectWidth) + (i * 10);
          }
      }
      d3.rebind(my, dispatch, "on");
      return my;
  }

    return NetworkChartInstances;
});