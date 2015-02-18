
describe("DataService", function(){
	var dataService, httpBackend, endpoint;

	beforeEach(module("sentiaApp"));

 	beforeEach(inject(function (_DataService_, $httpBackend) {
		DataService = _DataService_;
    	httpBackend = $httpBackend;
  	}));
	it("returns a data object", function(){
		httpBackend.whenJSONP("http://localhost:8080/edda/api/v2/view/instances;_expand;_callback=JSON_CALLBACK").respond({
	        data: "hello world"
	    });
	     DataService.getThings("http://localhost:8080/edda/api/v2/view/instances;_expand;_callback=JSON_CALLBACK").then(function(results) {
	      expect(results.data).toEqual("hello world");
	    });
	    httpBackend.flush();
	});
});
