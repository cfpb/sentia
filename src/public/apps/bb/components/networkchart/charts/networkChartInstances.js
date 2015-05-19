define(["jquery", "d3","moment"], function ($, d3, moment) {
    "use strict";
  var NetworkChartInstances = function() {
      //variables declared and defaults set , each of this can be overridden (typically are) via a method
      var instanceRectHeight = 120;
      var startXPosition = 73.007973;
      var startYPosition = 80;
      var regionRectWidth = 250;
      var parentRectWidth = 570;
      var regionRectTopPadding = 15;
      var rectStyle = {'opacity': 0.90946499999999997, 'fill': '#f68d00', 'fill-opacity': 1};  //default style
      var groupClassName = "instanceGroup";
      var rowPosition = 0;
      var itemsInRow = 0;
      var newRow = false;
      var dispatch = d3.dispatch("securityGroupHover","securityGroupHoverOut","privateIpsGroupHover","privateIpsGroupHoverOut",
          "privateIpsEc2ClassicGroupHover","privateIpsEc2ClassicGroupHoverOut","ebsHover","ebsHoverOut","tagsHover","tagsHoverOut");

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
                      .style("opacity",0.90946499999999997)
                      .style("fill", function (d,i){
                          if((d.state.name !== undefined)&& (d.state.name === "stopped")) {
                              return "#ff0000";
                          }
                          else{
                              return "#f68d00";
                          }
                      })
                      .style("fill-opacity",1)
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
                              rowPosition = rowPosition + instanceRectHeight + regionRectTopPadding;
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
                              //remove special characters
                              var rectId = d.name.replace(/(:|\.|\[|\]|,)/g,"");
                              return rectId;
                          }
                      });


                  //Add Text Labels to Each Instance
                  rowPosition = 0;
                  itemsInRow = 0;
                  newRow = false;

                  var labelSection = d3.select(this).selectAll("." + groupClassName)
                      .append("text")
                      .attr("class", groupClassName)
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
                              rowPosition = startYPosition + regionRectTopPadding;
                          }

                          //if adding the instance rect in this spot, causes it to be outside of parent rect
                          //then move down to next row
                          if (newRow) {
                              rowPosition = rowPosition + instanceRectHeight + regionRectTopPadding;
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
                          if (d.imageId) {
                                  return "Image id: " + d.imageId;
                          }
                          else {
                              return "Image id: ";
                          }
                      });

                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text(function (d) {
                          if (d.state) {
                              return "State: " + d.state.name;
                          }
                          else {
                              return "State: ";
                          }
                      });


                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text(function (d) {
                          if (d.launchTime) {
                              var formattedLaunchDate = moment(d.launchTime).format("M/D/YYYY h:MM:ss A");
                              return "Launched: " + formattedLaunchDate;
                          }
                          else {
                              return "Launched: ";
                          }
                      });


                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text(function (d) {
                          if (d.instanceType) {
                              return "Type: " + d.instanceType;
                          }
                          else {
                              return "Type: ";
                          }
                      });


                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text(function (d) {
                          if (d.kernelId) {
                              return "Kernel: " + d.kernelId;
                          }
                          else {
                              return "Kernel: ";
                          }
                      });

                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text(function (d) {
                          if (d.monitoring) {
                              if(d.monitoring.state){
                               return "Monitoring: " + d.monitoring.state;
                              }
                              else{
                                  return "Monitoring: ";
                              }
                          }
                          else {
                              return "Monitoring: ";
                          }
                      });

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
                          if (d.placement) {
                              if(d.placement.availabilityZone){
                                  return "Avail. Zone: " + d.placement.availabilityZone;
                              }
                              else{
                                  return "Avail. Zone: ";
                              }

                          }
                          else {
                              return "Avail. Zone: ";
                          }
                      });

                  //security group on hover item
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

                  //Private/Public Ips (EC2-Classic Ips )
                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text("EC2-Classic Ips Info.")
                      .attr("text-decoration", "underline")
                      .style("cursor", "pointer")
                      .on("mouseover", dispatch.privateIpsEc2ClassicGroupHover)
                      .on("mouseout", dispatch.privateIpsEc2ClassicGroupHoverOut);

                  //Private Ips (Elastic IPs interface) group on hover item
                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text("Elastic Ips Info.")
                      .attr("text-decoration", "underline")
                      .style("cursor", "pointer")
                      .on("mouseover", dispatch.privateIpsGroupHover)
                      .on("mouseout", dispatch.privateIpsGroupHoverOut);

                  //Ebs on hover item
                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text("Ebs")
                      .attr("text-decoration", "underline")
                      .style("cursor", "pointer")
                      .on("mouseover", dispatch.ebsHover)
                      .on("mouseout", dispatch.ebsHoverOut);

                  //tags on hover item
                  labelSection.append("tspan")
                      .attr("x", function (d) {
                          return this.parentElement.attributes.x.value;
                      })
                      .attr("dy", "10")
                      .text("Tags")
                      .attr("text-decoration", "underline")
                      .style("cursor", "pointer")
                      .on("mouseover", dispatch.tagsHover)
                      .on("mouseout", dispatch.tagsHoverOut);

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

      my.regionRectTopPadding = function (value){
          if(!arguments.length) return regionRectTopPadding;
          regionRectTopPadding = value;
          return my;
      };

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