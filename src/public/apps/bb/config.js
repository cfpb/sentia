require.config({
        deps: ['main'],
        paths:
        {
            jquery: '../../vendor/jquery/jquery',
            underscore: '../../vendor/underscore/underscore',
            backbone: '../../vendor/backbone/backbone',
            d3: '../../vendor/d3/d3',
            handlebars: '../../vendor/handlebars/handlebars',
            layoutmanager: '../../vendor/layoutmanager/backbone.layoutmanager',
            moment: '../../vendor/moment/moment'
        },
        shim: {
            underscore: {
                exports: '_'
            },
            backbone: {
                deps: ['underscore', 'jquery'],
                exports: 'Backbone'
            },
            handlebars: {
                exports: 'Handlebars'
            },
            layoutmanager: {
                deps: ['backbone']
            }
        },
        config: {
            moment: {
                noGlobal: true
            }
        }
    }
);