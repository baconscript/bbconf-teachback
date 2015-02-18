var View = require('ampersand-view');
var templates = require('../templates');

module.exports = View.extend({
    template: templates.includes.trip,

    // little collection view elements
    bindings: {
        'model.fullName': '[data-hook~=name]',
        'model.summary': '[data-hook~=summary]',
        'model.locationDetailed': '[data-hook~=locationDetailed]',

        'model.avatar': {
            type: 'attribute',
            hook: 'avatar',
            name: 'src'
        },

        'model.viewMapUrl': {
            type: 'attribute',
            hook: 'action-nav',
            name: 'href'
        },

        'model.viewRouteUrl': {
            type: 'attribute',
            hook: 'name',
            name: 'href'
        }
    }
});
