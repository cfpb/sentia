define(["app", "backbone", "components/home/homeApp", "components/networkchart/networkChartApp","components/networkchart/networkChartNonVpcsApp"],
    function (app, Backbone, homeApp, networkChartApp, networkChartNonVpcsApp) {
        var router = Backbone.Router.extend({
            routes:
            {
                "": "home",
                "/": "home",
                "home": "home",
                "networkChart": "networkChart",
                "/networkChart": "networkChart",
                "networkChartNonVpcs" :"networkChartNonVpcs",
                "/networkChartNonVpcs" :"networkChartNonVpcs"
            },
            home: function() {
               homeApp();
            },
            networkChart: function() {
                networkChartApp();
            },
            networkChartNonVpcs: function() {
                networkChartNonVpcsApp();
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
