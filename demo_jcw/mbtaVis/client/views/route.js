var View = require('ampersand-view');
var templates = require('../templates');

module.exports = View.extend({
    template: templates.includes.route,

    // little collection view elements
    bindings: {
        'model.fullName': '[data-hook~=name]',

        'model.avatar': {
            type: 'attribute',
            hook: 'avatar',
            name: 'style'
        },

        'model.viewTripsUrl': {
            type: 'attribute',
            hook: 'action-edit',
            name: 'href'
        },

        'model.viewRouteUrl': {
            type: 'attribute',
            hook: 'name',
            name: 'href'
        }
    }
});
