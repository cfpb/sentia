define(["app", "backbone", "components/home/homeApp", "components/networkchart/networkChartApp"],
    function (app, Backbone, homeApp, networkChartApp) {
        var router = Backbone.Router.extend({
            routes:
            {
                "": "home",
                "/": "home",
                "home": "home",
                "networkChart": "networkChart",
                "/networkChart": "networkChart"
            },
            home: function() {
               homeApp();
            },
            networkChart: function() {
                networkChartApp();
            },
            initialize: function() {
            },
            render_complete: function(el) {
            },
            navigate: function (page) {
                //variable that stores which page is active
                this.app_model.set("active", page);
            }
        });
        return router;
    }
);
