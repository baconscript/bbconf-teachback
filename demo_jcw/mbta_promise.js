/*
 * demo:    implicit error handling, lack of callback hell,
 *          declarative by nature, loosly coupled, highly composable
 */

var request = require('request'),
    qs = require('querystring'),
    q = require('q'),
    _ = require('lodash');


// get data
getRoutes()
    .then(function (result) {
        return groupRoutesByLine(
            parseRoutes(result),
            'Red Line'
        );
    })  // .groupRoutesByLine() returns a non-thenable...
    // but .then() returns a new promise, getRoutes is resolved!

    .then(function (routes) {
        // map .getPredictions() across array of routes for this line...
        var promises = _.map(_.pluck(routes, 'route_id'), getPredictions);
        return q.all(promises); // evaluate all requests, then return an array of newly resolved promises!
    })

    .then(function (predictions) {
        // parse predictions for each line, then map .getAlerts() across each route...
        var predictionData = _.map(predictions, parsePredictions),
            promises = _.map(_.pluck(predictionData, 'route_id'), getAlerts);

        // evaluate all requests, then combine datasets (note the nested promise chain, and closure!)
        return q.all(promises).then(function (alerts) {
            var alertData = _.map(alerts, parseAlerts);

            return _.merge(
                _.groupBy(predictionData, 'route_id'),
                _.groupBy(alertData, 'route_id')
            );
        });
    })
    .then(printResponse, console.error); // any errors that occurred along the way will propagate down here

function getQueryString(query, queryArgs) {
    var url = 'http://realtime.mbta.com/developer/api/v2/' + query,
        args = '?' + qs.stringify(_.merge({
            api_key: 'wX9NwuHnZU2ToO7GmGR9uw', // api key from docs
            format: 'json'
        }, queryArgs));

    return url + args;
}

function makeRequest(method, query, args) {
    var deferred = q.defer(),
        options = {
            method: method,
            url: getQueryString(query, args || {})
        };

    request(options, function (err, res, body) {
        if (err || res.statusCode !== 200) { // if !200, error IS body, as XML... thanks MBTA
            deferred.reject(err || body);
        } else {
            deferred.resolve(body);
        }
    });

    return deferred.promise;
}

function getRoutes() {
    return makeRequest('GET', 'routes', null);
}

function getPredictions(route) {
    return makeRequest('GET', 'predictionsbyroute', { route: route });
}

function getAlerts(route) {
    return makeRequest('GET', 'alertsbyroute', { route: route, include_service_alerts: true });
}

function groupRoutesByLine(routes, line) {
    var routes = _.groupBy(routes, function (route) {
        return route['route_name'];
    });

    if (!routes[line]) throw new Error('No routes for ' + line);
    return routes[line];

}

function parseRoutes(response) {
    var result = JSON.parse(response),
        routes = _.findWhere(result.mode, {
            mode_name: 'Subway',
            route_type: '1'
        });

    return routes.route;
}

function parsePredictions(response) {
    var result = JSON.parse(response),
        predictions = _.omit(result, 'alert_headers');

    return predictions;
}

function parseAlerts(response) {
    var result = JSON.parse(response),
        alerts = result;

    return alerts;
}

function printResponse(response) {
    console.log(JSON.stringify(response, null, 2));
}
