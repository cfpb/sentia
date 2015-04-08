require.config({
        deps: ['main'],
        paths:
        {
            jquery: '../../vendor/jquery/jquery',
            underscore: '../../vendor/underscore/underscore',
            backbone: '../../vendor/backbone/backbone',
            d3: '../../vendor/d3/d3',
            handlebars: '../../vendor/handlebars/handlebars',
            layoutmanager: '../../vendor/layoutmanager/backbone.layoutmanager'
        },
        shim: {
            underscore: {
                exports: '_'
            },
            backbone: {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            },
            d3: {
                exports: 'd3'
            },
            handlebars: {
                exports: 'Handlebars'
            },
            layoutmanager: {
                deps: ['backbone']
            }
        }
    }
);