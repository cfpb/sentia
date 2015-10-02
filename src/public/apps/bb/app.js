define(['jquery', 'underscore', 'backbone', 'handlebars', 'layoutmanager'
], function ($, _, Backbone, Handlebars) {
    'use strict';

    var dispatcher = {};
    _.extend(dispatcher, Backbone.Events);
    dispatcher = _.clone(Backbone.Events);

    var app = {
        root: '/',
        isIE: /msie/i.test(navigator.userAgent) && !window.opera, //easy way to determine if ie
        isLowerIE8: (document.all && !document.querySelector) ? true: false,  //ie less than ie 8
        dispatcher: dispatcher,
        api:
        {
            instancesUrl: '/api/instances/?filter={"providers": ["aws"] }',
            availabilityZonesUrl: '/api/availabilityzones/?filter={"providers": ["aws"] }',
            vpcsUrl:'/api/vpcs/?filter={"providers": ["aws"] }',
            subnetsUrl:'/api/subnets/?filter={"providers": ["aws"] }'
        }
    };

    //localize or create a new Javascript Template Object
    var JST = window.JST = window.JST || {};

    //configure Backbone Layoutmanager
    Backbone.Layout.configure({
        manage: true,
        prefix: 'public/apps/bb/shared/templates/',
        fetchTemplate: function(path) {
            var done;
            path = path + '.hbs';
            //if template has not been loaded yet, then load it
            if (!JST[path]) {
                done = this.async();

                return $.ajax({ url: app.root + path}).then(function(contents) {
                    JST[path] = Handlebars.compile(contents);
                    JST[path].__compiled__ = true;
                    done(JST[path]);
                });
            }

            //if template hasn't been compiled yet, then compile.
            if (!JST[path].__compiled__) {
                JST[path] = Handlebars.template(JST[path]);
                JST[path].__compiled__ = true;
            }

            return JST[path];

        }
    });

    //Mix-in Backbone.Events to add additional Properties, for example app.root , isIE, isLowerIE8 in this file
    return _.extend(app, {
        //Create a custom object with a nested Views object.
        module: function (additionalProps) {
            return _.extend({ Views: {} }, additionalProps);
        },
        useLayout: function(name, options) {

            this.layout = new Backbone.Layout({
                template: name,
                el: "#main_container",
                views: options.view
            });

            return this.layout;
        }
    }, Backbone.Events);

    return app;
});