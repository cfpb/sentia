require(['app','router','backbone'], function (app, Router, Backbone) {
    //Define your master router on the application namespace and trigger all 
    //navigation from this instance
    app.Router = new Router();

    //Trigger the initial route and enable HTML5 History API support, set
    //the root folder to '/'  by default. 
    //Backbone.history.start({ pushState: true});
    Backbone.history.start();

});