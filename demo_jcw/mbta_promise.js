var q = require('q'),
    _ = require('lodash'),
    T = require('./mbta_promise_helpers');


T.getRoutes()
    .then(function (result) {
        return T.groupRoutesByLine(     // returns a non-thenable, but .then() wraps a new promise for us
            T.parseRoutes(result),
            'Red Line'
        );
    })

    // map .getPredictions() across routes, get array of promises -> evaluate requests, return array of settled promises
    .then(function (routes) {
        var promises = _.map(_.pluck(routes, 'route_id'), T.getPredictions);
        return q.all(promises);
    })

    // parse predictions for each line, then map .getAlerts() across each route
    .then(function (predictions) {
        var predictionData = _.map(predictions, T.parsePredictions),
            promises = _.map(_.pluck(predictionData, 'route_id'), T.getAlerts);

        // evaluate all requests, then combine datasets (note the nested promise chain, and closure!)
        return q.all(promises).then(function (alerts) {
            var alertData = _.map(alerts, T.parseAlerts);

            return _.merge(
                _.groupBy(predictionData, 'route_id'),
                _.groupBy(alertData, 'route_id')
            );
        });
    })
    .then(T.printResponse, console.error);  // any errors that occurred along the way will propagate down here
