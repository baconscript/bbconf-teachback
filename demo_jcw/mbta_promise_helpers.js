var q = require('q'),
    qs = require('querystring'),
    request = require('request'),
    _ = require('lodash');

module.exports = {
    getRoutes: getRoutes,
    getPredictions: getPredictions,
    getAlerts: getAlerts,
    groupRoutesByLine: groupRoutesByLine,
    parseRoutes: parseRoutes,
    parsePredictions: parsePredictions,
    parseAlerts: parseAlerts,
    printResponse: printResponse,
    getQueryString: getQueryString,
    makeRequest: makeRequest
};

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

    if (!line) return _.flatten(_.values(routes));
    //if (!routes[line]) throw new Error('No routes for ' + line);
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
