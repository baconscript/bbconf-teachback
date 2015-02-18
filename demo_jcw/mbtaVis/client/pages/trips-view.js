/*global app, alert*/
var PageView = require('./base');
var templates = require('../templates');
var TripView = require('../views/trip');

// route details page
module.exports = PageView.extend({
    pageTitle: 'view trips',

    template: templates.pages.tripsView,
    events: {
        'click [data-hook~=fetch]': 'fetchCollection'
    },

    initialize: function(spec) {
        this.collection.reset();
        this.collection.url = this.collection.baseUrl + spec.id;
    },

    render: function () {
        this.renderWithTemplate();
        this.renderCollection(this.collection, TripView, this.queryByHook('trips-list'));
        this.fetchCollection();
    },

    fetchCollection: function () {
        this.collection.fetch();
        return false;
    }
});
