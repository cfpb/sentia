var globalRootDebug, globalPackDebug, endpoint;

endpoint = serverUrl + "edda/api/v2/view/instances;_expand;_callback=JSON_CALLBACK";

var sentiaApp = angular.module("sentiaApp", []);

sentiaApp.controller("sentiaAppCtrl", function($scope, DataService, $http, $sce){
	
	DataService.getThings().then(function(result){
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

	$scope.discovery = {
		req_status: false,
		host_name: "",
		processes: [],
		yum_installed: [],
		python_libraries: {}
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
						securityGroups: {key: "securityGroups", label: "Security Groups:", value: ""},
						rootDeviceName: {key: "rootDeviceName", label: "Root Device Name:", value: ""},
						discoveryDetails: {key: "discoveryDetails", label: "Software Details: ", value: "", software: ""  } };
	
	$scope.renderHtml = function(html_code){
		return $sce.trustAsHtml(html_code);
	};

	$scope.search = {
		state: "",
		privateIpAddress: "",
		eddaString: ""
	};

});

sentiaApp.service("DataService",["$http","$q",function($http, $q){
  return {
    getThings: function(){
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
	- Possibly add deferreds to ensure promises kept
	- Add loading icon and/or property so data not displayed until done loading
	- OnClick event to load server details instead of mouse-over?
	- Bind filters to D3 visualization
	- Merge Subnet data using _ or other data manipulation in cleanup function
*/
sentiaApp.directive("serverDetails", function($http) {
	return {
	    restrict: "E",
	    template: 	"<div ng-show='discovery.req_status'><h6>{{ discovery.host_name }}</h6>" + 
					"<h4>Yum Installed Software</h4>" +
	    			"<div ng-repeat='proc in discovery.processes'><li>{{ proc }}</li></div></div>",
	    link: function(scope, element, attr) {	    	
	    	scope.$watchCollection("fields.privateIpAddress", function (newVal, oldVal) {
				// if 'val' is undefined, exit
				console.log("newVal", newVal, "oldVal", oldVal);
				
				if (!newVal) {
					return;
				}

				var ip = newVal.value,
					elasticEndpoint = discoveryUrl + "installedsoftware/_search?q=ip_address:" + ip + "&callback=JSON_CALLBACK";
				
				console.log("IP: ", ip);
				console.log("Endpoint: ", elasticEndpoint);

	            $http.jsonp(elasticEndpoint).success(function(data) {
	            	// shorthand time-saver
	            	var disc = scope.discovery;
	            	console.log("Discovery Data: ", data);
	            	if(data.hits.hits.length < 1){
	            		disc.req_status = false;
	            		// disc.yum_installed = [];
	            		// disc.processes = [];

	            	} else {
						var results = data.hits.hits;
		            	console.log("Discovery Results: ", results);
		            	// // THIS IS A HACK TO GET THE LAST ELASTICSEARCH RESULT - CHANGE THIS SO A SINGLE RESULT COMES BACK
		            	var length = results.length - 1;
		            	var lastResult = results[length];
		            	console.log("Last result: ", lastResult);
		            	disc.yum_installed = lastResult._source.yum_installed;
		            	disc.processes = lastResult._source.processes;
		            	// Set scope so expandables work
		            	disc.req_status = true;
	            	}
	            	
	            }).error(function(data, status, headers, config){
	            	console.log("An error occurred with your ES query: ", status);
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

				var node = svg.selectAll("circle.node,text");

				var nodeLeaf = svg.selectAll(".node--leaf")
					.on("mouseover", function(d){ return drawInstanceDetails(d, scope.fields, scope); });

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
