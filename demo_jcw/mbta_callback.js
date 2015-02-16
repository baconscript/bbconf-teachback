/*
 * disclaimer:  this code is relatively disgusting, let's see how it can be improved with promises!
 * demo:        try changing 'Red Line' to 'Green Line' and see what happens, can you easily debug it?
 */

var async = require('async'),
    request = require('request'),
    qs = require('querystring'),
    _ = require('lodash');


// get data
getRoutes(function (err, response) {
    if (err) {
        console.error(err);
    } else {
        var routes = routesByLine(
                parseRoutes(response),
                'Red Line'
            ),
            map = {};

        async.eachSeries(routes, function (route, done) {
            getPredictions(route['route_id'], function(err, data) {
                if (err) {
                    console.error(err);
                } else {
                    map[route['route_id']] = parsePredictions(data);
                    getAlerts(route['route_id'], function(err, data) {
                        if (err) {
                            console.log(err);
                        } else {
                            map[route['route_id']].alerts = parseAlerts(data);
                        }
                        done();
                    });
                }
            });
        }, function () {
            printResponse(map);
        });
    }
});

function getQueryString(query, queryArgs) {
    var url = 'http://realtime.mbta.com/developer/api/v2/' + query,
        args = '?' + qs.stringify(_.merge({
            api_key: 'wX9NwuHnZU2ToO7GmGR9uw', // api key from docs
            format: 'json'
        }, queryArgs));

    return url + args;
}

function makeRequest(method, query, args, callback) {
    var options = {
        method: method,
        url: getQueryString(query, args || {})
    };

    request(options, function(err, res, body) {
        if (err || res.statusCode !== 200) { // if !200, error IS body, as XML... thanks MBTA
            callback(err || body, null);
        } else {
            callback(null, body);
        }
    });
}

function getRoutes(callback) {
    makeRequest('GET', 'routes', null, function(err, res) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, res);
        }
    });
}

function getPredictions(route, callback) {
    makeRequest('GET', 'predictionsbyroute', { route: route }, function(err, res) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, res);
        }
    });
}

function getAlerts(route, callback) {
    makeRequest('GET', 'alertsbyroute', { route: route, include_service_alerts: true }, function(err, res) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, res);
        }
    });
}

function routesByLine(routes, line) {
    var routes = _.groupBy(routes, function(route) {
        return route['route_name'];
    });

   return routes[line] || null;

}

function parseRoutes(response) {
    var result = JSON.parse(response),
        routes = _.findWhere(result.mode, {
            mode_name: 'Subway',
            route_type: '1'
        });

    return routes ? routes.route : null;
}

function parsePredictions(response) {
    var result = JSON.parse(response),
        predictions = _.omit(result, 'alert_headers');

    return predictions;
}

function parseAlerts(response) {
    var result = JSON.parse(response),
        alerts = result.alerts;

    return alerts;
}

function printResponse(response) {
    console.log(JSON.stringify(response, null, 2));
}
