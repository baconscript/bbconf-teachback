var mbta = require('../mbta_promise_robust'),
    _ = require('lodash'),
    routes = [],
    trips = {};

// poll api every 7s
setInterval(function () {
    fetch();
}, 7 * 1000);
fetch();

// api routes
exports.routes = function (req, res) {
    res.send(routes);
};

exports.trips = function (req, res) {
    res.status(_(trips).has(req.params.id) ? 200 : 404);
    res.send(trips[req.params.id] || []);
};

// munge the data a little bit
exports.fetch = fetch;
function fetch(color) {
    mbta.fetch(color).then(function (data) {
        var newRoutes = [],
            newTrips = [];

        try {
            _.forOwn(data, function (val) {
                var route = _.first(val);

                route && _.forEach(route.direction, function (direction) {
                    newRoutes.push({
                        id: route.route_id,
                        route_name: route.route_name,
                        route_type: route.route_type,
                        mode_name: route.mode_name,
                        direction: direction ? direction.direction_name : '',
                        alerts: _.pluck(route.alerts, 'short_header_text').join('; ')
                    });

                    direction && _.forEach(direction.trip, function (trip) {
                        var vehicle = trip.vehicle || {},
                            stop = _.first(trip.stop) || {};

                        trip && newTrips.push({
                            route_id: route.route_id,
                            trip_id: trip.trip_id,
                            trip_name: trip.trip_name,
                            trip_headsign: trip.trip_headsign,
                            vehicle_id: vehicle.vehicle_id,
                            vehicle_lat: vehicle.vehicle_lat,
                            vehicle_lon: vehicle.vehicle_lon,
                            vehicle_bearing: vehicle.vehicle_bearing,
                            vehicle_timestamp: vehicle.vehicle_timestamp,
                            stop_name: stop.stop_name,
                            pre_away: stop.pre_away
                        });
                    });
                });
            });
        } catch (e) {
            console.error(e);
        }

        if (newRoutes.length && newTrips.length) {
            routes = newRoutes;
            trips = _.groupBy(newTrips, 'route_id');

            console.log('[' + Date.now() + '] got ' + routes.length + ' routes and ' + newTrips.length + ' trips!');
        } else {
            console.error('[' + Date.now() + '] mbta API failed to return new data...');
        }
    });
}