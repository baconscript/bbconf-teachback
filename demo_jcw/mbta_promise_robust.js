var T = require('./mbta_promise_helpers'),
    q = require('q'),
    _ = require('lodash');


// get data
module.exports.fetch = function (color) {
    return T.getRoutes()
        .then(function (routes) {
            return T.groupRoutesByLine(T.parseRoutes(routes), color);
        })
        .then(function (routes) {
            var promises = _(routes).pluck('route_id').map(T.getPredictions).value();
            return q.allSettled(promises);
        })
        .then(function (result) {
            var predictions = _(result).where({state: 'fulfilled'}).pluck('value').map(T.parsePredictions).value(),
                promises = _(predictions).pluck('route_id').map(T.getAlerts).value();

            return q.allSettled(promises).then(function (result) {
                var alerts = _(result).where({state: 'fulfilled'}).pluck('value').map(T.parseAlerts).value();
                return _.merge(_.groupBy(predictions, 'route_id'), _.groupBy(alerts, 'route_id'));
            });
        })
        .then(function (data) {
            return data;
        }, console.error);
};

// called, or required?
if (require.main === module) {
    module.exports.fetch().then(T.printResponse, console.error);
}