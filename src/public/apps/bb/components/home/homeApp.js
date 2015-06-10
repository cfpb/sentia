define(['../../app', 'backbone', 'd3','components/home/views/homeview' ],
    function(app, Backbone, d3, HomeView) {
        "use strict";

        var homeApp = function() {
            var hmView = new HomeView({ manage: true });
            var layoutHome = app.useLayout('main', { view: { '#containerOne' : hmView } });
            layoutHome.render();
        };

        return homeApp;
    });
