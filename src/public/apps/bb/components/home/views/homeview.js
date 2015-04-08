define(['jquery','underscore','backbone','layoutmanager'], function ($, _, Backbone) {
    var homeView = Backbone.Layout.extend({
        tagName: 'div',
        template: 'home/home',
        afterRender: function () {
            console.log('homeview afterRender');
        }
    });

    return homeView;
});