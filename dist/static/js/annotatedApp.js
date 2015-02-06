var globalRootDebug, globalPackDebug, endpoint;

endpoint = serverUrl + "edda/api/v2/view/instances;_expand;_callback=JSON_CALLBACK";

var sentiaApp = angular.module("sentiaApp", []);

sentiaApp.controller("sentiaAppCtrl", ["$scope", "DataService", "$http", "$sce", function($scope, DataService, $http, $sce){
	
	DataService.getThings().then(function(result){
		$scope.eddaData = { key: "Enclave", values: result};
	});

	$scope.filterObj = {};
	
	// Set the fields we'd like to pull back for each instance in the detail view - single global to update all this stuff 
	// that will dynamically create the details table with all the correct fields and query the values properly from Edda on Mouseover
	$scope.fields = [ {key: "state", label: "State:", value: ""}, {key: "instanceType", label: "Instance Type:", value: ""},
							{key: "privateDnsName", label: "Private DNS Name:", value: ""}, {key: "privateIpAddress", label: "Private IP Address:", value: ""},
							{key: "subnetId", label: "Subnet ID:", value: ""},{key: "vpcId", label: "VPC ID:"},{ key: "tags", label: "Tags:", value: ""},
							{key: "securityGroups", label: "Security Groups:", value: ""},
							{key: "rootDeviceName", label: "Root Device Name:", value: ""} ];
	$scope.renderHtml = function(html_code){
		return $sce.trustAsHtml(html_code);
	};
}]);

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


sentiaApp.directive("networkVisual", function(){
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
	            case "state":
	                detailContent = "";
	                detailContent = dataVal.name;
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
	    switch(d.state.name){
	        case "running":
	            return "#ADDC91";
	        case "stopped":
	            return "#E8A091";
	        default:
	            return null;
	    }
	}

	/* THE BIG RETURN */
	return {
		restrict: "E",
		scope: {
			val: "=",
			fields: "=",
			dataFilter: "@"
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
				console.log("EddaJson as Root Data: ", root);

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

				var nodeLeaf = svg.selectAll(".node--leaf,text")
					.on("mouseover", function(d){ return drawInstanceDetails(d, scope.fields, scope); });

				d3.select("svg")
					.on("click", function() { scope.apply(function(){zoom(root);}); });

				function zoomTo(v) {
					console.log("ZoomTo called.");
					console.log("What is V?: ", v);
					var k = diameter / v[2]; scope.view = v;
					node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
					circle.attr("r", function(d) { return d.r * k; });
				}

				zoomTo([root.x, root.y, root.r * 2 + margin]);

				function zoom(d) {
					console.log("Zoom called.");
					var focus0 = focus; focus = d;

					var transition = d3.transition()
						.duration(d3.event.altKey ? 7500 : 750)
						.tween("zoom", function(d) {
							console.log("What is scope.view?: ", scope.view);
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
		scope.$apply( function(){console.log("This is the apply at the end of the Link");});	
		}
	};
});
