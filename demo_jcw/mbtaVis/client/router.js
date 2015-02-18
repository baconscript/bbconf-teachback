/*global me, app*/
var Router = require('ampersand-router');
var HomePage = require('./pages/home'),
    RoutesPage = require('./pages/routes'),
    RouteViewPage = require('./pages/route-view'),
    TripsViewPage = require('./pages/trips-view'),
    InfoPage = require('./pages/info');


module.exports = Router.extend({
    routes: {
        '': 'home',
        'routes': 'routesView',
        'route/:id': 'routeView',
        'trips/:id': 'tripsView',
        'info': 'info',
        '(*path)': 'catchAll'
    },

    // ------- ROUTE HANDLERS ---------
    home: function () {
        this.trigger('page', new HomePage({
            model: me
        }));
    },

    routesView: function () {
        this.trigger('page', new RoutesPage({
            model: me,
            collection: app.routes
        }));
    },

    routeView: function (id) {
        this.trigger('page', new RouteViewPage({
            id: id
        }));
    },

    tripsView: function (id) {
        this.trigger('page', new TripsViewPage({
            id: id,
            collection: app.trips
        }));
    },

    info: function () {
        this.trigger('page', new InfoPage({
            model: me
        }));
    },

    catchAll: function () {
        this.redirectTo('');
    }
});
