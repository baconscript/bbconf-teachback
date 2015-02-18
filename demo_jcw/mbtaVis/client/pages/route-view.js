/*global app, alert*/
var PageView = require('./base');
var templates = require('../templates');


// route details page
module.exports = PageView.extend({
    pageTitle: 'view route',

    template: templates.pages.routeView,

    // map model attributes -> template data-hooks
    bindings: {
        'model.route_name': '[data-hook=name]',
        'model.id': '[data-hook=id]',
        'model.details': '[data-hook=details]',
        'model.alerts': '[data-hook=alerts]',

        'model.avatar': {
            hook: 'avatar',
            type: 'attribute',
            name: 'style'
        },

        'model.viewTripsUrl': {
            hook: 'action-nav',
            type: 'attribute',
            name: 'href'
        }
    },

    initialize: function (spec) {
        var self = this;
        app.routes.getOrFetch(spec.id, {all: true}, function (err, model) {
            if (err) alert('couldn\'t find a model with id: ' + spec.id);
            self.model = model;
        });
    }
});
