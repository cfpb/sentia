var globalRootDebug, globalPackDebug, endpoint;

var sentiaApp = angular.module("sentiaApp", []);

sentiaApp.controller("sentiaAppCtrl", function($scope, DataService, $http, $sce){
	
	eddaEndpoint = serverUrl + "edda/api/v2/view/instances;_expand;_callback=JSON_CALLBACK";

	DataService.getThings( eddaEndpoint ).then(function(result){
		var data = formatResponse(result);
		$scope.eddaData = { key: "Enclave", values: data };
	});

	// Handle data formatting here
	var formatResponse = function (data) {
		data.forEach(function (datum) {
			if(typeof datum.state.name !== "undefined"){
				var state = datum.state.name;
				datum.state = state;
			}
		});
		return data;
	};

	// Loading variable for server discovery data (sets spinner)
	$scope.loading = 0;

	$scope.discovery = {
		req_status: false,
		host_name: "",
		processes: [],
		yum_installed: [],
		python_libraries: {},
		iptables: [],
	};

	$scope.filterObj = {};
	
	// Set the fields we'd like to pull back for each instance in the detail view - single global to update all this stuff 
	// that will dynamically create the details table with all the correct fields and query the values properly from Edda on Mouseover
	$scope.fields = { state: {key: "state", label: "State:", value: ""}, 
						instanceType: {key: "instanceType", label: "Instance Type:", value: ""},
						privateDnsName: {key: "privateDnsName", label: "Private DNS Name:", value: ""}, 
						privateIpAddress: {key: "privateIpAddress", label: "Private IP Address:", value: ""},
						subnetId: {key: "subnetId", label: "Subnet ID:", value: ""},
						vpcId: {key: "vpcId", label: "VPC ID:"},
						tags: {key: "tags", label: "Tags:", value: ""},
						securityGroups: {key: "securityGroups", label: "Security Groups:", value: ""}
					};

	$scope.renderHtml = function(html_code){
		return $sce.trustAsHtml(html_code);
	};

	$scope.search = {
		state: "",
		privateIpAddress: "",
		eddaString: "",
		yum: "",
		python: "",
		processes: "",
		iptables: "",
		instanceType: "",
		subnetId: "",
		vpcId: "",
		tags: "",
		security: ""
	};

});

sentiaApp.service("DataService",["$http","$q",function($http, $q){
  return {
    getThings: function(endpoint){
        var dfd = $q.defer();
		$http.jsonp(endpoint)
		.success(function(data){
			dfd.resolve(data);
			console.log("Here's the result of the DataService: ", data);
		})
		.error(function(data, status, headers, config) {
				console.log("Error occurred with status: ", status);
		});
		return dfd.promise;
    }
  };
}]);

//TO DO HERE:
/* 
	X Possibly add deferreds to ensure promises kept (now all calls use Data Service)
	X Add loading icon and/or property so data not displayed until done loading
	- Make expandables into Tabs
	X OnClick event to load server details instead of mouse-over?
	- Bind filters to D3 visualization
	- Merge Subnet data using _ or other data manipulation in cleanup function
*/
sentiaApp.directive("serverDetails", function(DataService, $http) {
	return {
	    restrict: "E",
	    templateUrl: "serverDetailsTemplate.html", 	
	    link: function(scope, element, attr) {	    	
	    	scope.$watchCollection("fields.privateIpAddress", function (newVal, oldVal) {
				// if 'val' is undefined, exit
				console.log("newVal", newVal, "oldVal", oldVal);
				
				if (!newVal) {
					return;
				}

				// shorthand time-saver for scope.discovery
				var disc = scope.discovery;

				disc.req_status = false;

				var ip = newVal.value,
					elasticEndpoint = discoveryUrl + "installedsoftware/_search?q=ip_address:" + ip + "&callback=JSON_CALLBACK";
				
				console.log("IP: ", ip);
				console.log("Endpoint: ", elasticEndpoint);

				// Start loading icon spinning
				console.log("scope loading: ", scope.loading);
				scope.loading++;
				DataService.getThings( elasticEndpoint ).then(function(data){
					if(data.hits.hits.length < 1){
						// Decrement Scope Loading and reqest status
						scope.loading--;
	            		disc.req_status = false;
	            		console.log("No hits for this server.");

	            	} else {
						var results = data.hits.hits;
		            	console.log("Discovery Results: ", results);
		            	// // THIS IS A HACK TO GET THE LAST ELASTICSEARCH RESULT - CHANGE THIS SO A SINGLE RESULT COMES BACK
		            	var length = results.length - 1;
		            	var lastResult = results[length]._source;
		            	console.log("Last result: ", lastResult);
		            	// END HACK

		            	disc.yum_installed = lastResult.yum_installed;
		            	disc.python_libraries = lastResult.python_libraries;
		            	disc.processes = lastResult.processes;
		            	disc.host_name = lastResult.host_name;
		            	disc.iptables = lastResult.iptables;
		            	// Set scope so expandables work
		            	disc.req_status = true;
						scope.loading--;
	            	}
				});

	        });
	    }
	};
});

sentiaApp.directive("networkVisual", function(){
	/* DIRECTIVE CONSTANTS */

	// Example borrowed from Mike Bostock's Awesome Zoomable Circle Packing: http://bl.ocks.org/mbostock/7607535
	var margin = 20,
		diameter = 600; // TODO: Make this be 75% of the page width

	var color = d3.scale.linear()
		.domain([-1, 5])
		.range(["#E3E4E5","#75787B"])
		.interpolate(d3.interpolateHcl);
	
	var svg = d3.select("network-visual").append("svg")
		.attr("width", diameter)
		.attr("height", diameter)
		.append("g")
		.attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");	

	function drawInstanceDetails(d, fields, scope){
	    // For each key in each object, write to the page
	    for(var i in fields){
	        var valKey = fields[i].key,
	            dataVal = d[valKey],
	            detailContent = dataVal;

	        switch(valKey){
	            case "tags":
	                detailContent = "";
	                for( var j in dataVal ){
	                    detailContent +=  dataVal[j].key + ": "+ dataVal[j].value + "<br/>";
	                }
	                break;
	            case "securityGroups":
	                detailContent = "";
	                for( var k in dataVal ){
	                    detailContent += dataVal[k].groupName + "<br/>";
	                }
	                break;
	            default:

	                break;
	        }

	        fields[i].value = detailContent;
	    }
        scope.$apply(function(){
        	console.log("Fields updated in scope apply.");
        });
	}

	/* 
	    UTILITY FUNCTIONS  
	*/

	function getCircleSize(instType){
	    switch( instType ){
	        case "":
	            return 300;
	        case "":
	            return 200;   
	        default:
	            return 100;
	    }
	}

	// Determine the class that should be assigned to a node as drawn in D3.
	// This will fix hierarchy labeling and coloration issues.
	function getNodeClass( d ){
	    var nodeClass = d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
	    var keyVal = d.key;

	    if ( typeof keyVal === "undefined"){
	        keyVal = "instance";
	    } else if ( keyVal.indexOf("vpc") >= 0 ){
	        keyVal = "vpc";
	    } else if ( keyVal.indexOf("subnet") >= 0 ){
	        keyVal = "subnet";
	    } else {
	        keyVal = "other";
	    }

	    if ( keyVal === "instance"){
	    
		    d.securityGroups.forEach( function (group) {
		    	keyVal += " " + group.groupName;
		    });	    	
	    }
	   
	    return nodeClass + " " + keyVal;
	}

	function getInstanceColor( d ){
	    switch(d.state){
	        case "running":
	            return "#ADDC91";
	        case "stopped":
	            return "#E8A091";
	        default:
	            return null;
	    }
	}

	/* THE BIG RETURN FOR THE DIRECTIVE*/
	return {
		restrict: "E",
		scope: {
			val: "=",
			fields: "=",
			dataFilter: "="
		},
		link: function(scope, element, attr){

			var margin = 20,
				diameter = 600; // TODO: Make this be 75% of the page width

			var pack = d3.layout.pack()
				.padding(2)
				.size([diameter - margin, diameter - margin])
				.value(function(d) { return 500; })
				.children(function(d){ return d.values;});

			scope.$watch("val", function (newVal, oldVal) {
				// Clear all elements inside the directive
				svg.selectAll("*").remove();

				// if 'val' is undefined, exit
				if (!newVal) {
					return;
				}

				nestedNewVal = { key: "Enclave",
									values: d3.nest()
										.key(function(d) { return d.vpcId; })
										.key(function(d) { return d.subnetId; })
										.entries( newVal.values )
							};

				var root = nestedNewVal;

				var focus = root,
				nodes = pack.nodes(root);

				var circle = svg.selectAll("circle")
					.data(nodes)
					.enter().append("circle")
					.attr("class", function(d) { return getNodeClass(d); })
					.attr("data-identifier", function(d) { return d.key ? d.privateIpAddress : "NO INFO"; })
					.style("fill", function(d) { return d.children ? color(d.depth) : getInstanceColor(d); })
					.on("click", function(d) { if (focus !== d){ scope.$apply(function(){zoom(d);}); } else { d3.event.stopPropagation();} });

				var text = svg.selectAll("text")
					.data(nodes)
					.enter().append("text")
					.attr("class", "label")
					.style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
					.style("display", function(d) { return d.parent === root ? null : "none"; })
					.text(function(d) {
					if( typeof d.key === "undefined"){
						return d.privateIpAddress;
					} else {
						return d.key;
					}
				});

				var tip = d3.tip()
				  .attr("class", "d3-tip")
				  .offset([-10, 0])
				  .html(function(d) {
				  	var returnVal;
					if( typeof d.key === "undefined"){
						returnVal =  d.privateIpAddress;
					} else {
						returnVal = d.key;
					}
				    return "<strong>" + returnVal + "</strong>";
				});					

				var node = svg.selectAll("circle.node,text");
				
				var nodeCircles = svg.selectAll("circle.node")
					.call(tip)
					.on("mouseover", tip.show)
  					.on("mouseout", tip.hide);

				var nodeLeaf = svg.selectAll(".node--leaf")
					.on("click", function(d){ return drawInstanceDetails(d, scope.fields, scope); });

				function zoomTo(v) {
					var k = diameter / v[2]; scope.view = v;
					node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
					circle.attr("r", function(d) { return d.r * k; });
				}

				zoomTo([root.x, root.y, root.r * 2 + margin]);

				function zoom(d) {
					var focus0 = focus; focus = d;

					var transition = d3.transition()
						.duration(d3.event.altKey ? 7500 : 750)
						.tween("zoom", function(d) {
							var i = d3.interpolateZoom(scope.view, [focus.x, focus.y, focus.r * 2 + margin]);
							scope.$apply();
							return function(t) { zoomTo(i(t)); };
						});

					transition.selectAll("text")
						.filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
						.style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
						.each("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
						.each("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
				}

				d3.select(self.frameElement).style("height", diameter + "px");

			});
			// END SCOPE WATCH


		// END LINK FUNCTION RETURN		
		scope.$apply();	
		}
	};
});

// OTHER UTILITY FUNCTIONS

