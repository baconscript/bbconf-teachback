var PageView = require('./base');
var templates = require('../templates');
var RouteView = require('../views/route');


module.exports = PageView.extend({
    pageTitle: 'routes',
    template: templates.pages.routesView,
    events: {
        'click [data-hook~=fetch]': 'fetchCollection'
    },

    render: function () {
        this.renderWithTemplate();
        this.renderCollection(this.collection, RouteView, this.queryByHook('routes-list'));
        if (!this.collection.length) {
            this.fetchCollection();
        }
    },

    fetchCollection: function () {
        this.collection.fetch();
        return false;
    }
});
