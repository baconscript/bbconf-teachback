var request = require('request'),
    qs = require('querystring'),
    q = require('q'),
    _ = require('lodash');

// get data
exports.fetch = function (color) {
    return getRoutes()
        .then(function (routes) {
            return groupRoutesByLine(parseRoutes(routes), color);
        })
        .then(function (routes) {
            var promises = _(routes).pluck('route_id').map(getPredictions).value();
            return q.allSettled(promises);
        })
        .then(function (result) {
            var predictions = _(result).where({state: 'fulfilled'}).pluck('value').map(parsePredictions).value(),
                promises = _(predictions).pluck('route_id').map(getAlerts).value();
            return q.allSettled(promises).then(function (result) {
                var alerts = _(result).where({state: 'fulfilled'}).pluck('value').map(parseAlerts).value();
                return _.merge(
                    _.groupBy(predictions, 'route_id'),
                    _.groupBy(alerts, 'route_id')
                );
            });
        })
        .then(function (data) {
            return data;
        }, console.error);
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

function groupRoutesByLine(routes, color) {
    var routes = _.groupBy(routes, function (route) {
        return route['route_name'];
    });

    if (!color) return _.flatten(_.values(routes));
    if (!routes[color]) throw new Error('No routes for ' + color);
    return routes[color] || [];
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
    var result = JSON.parse(response);

    return result;
}

function printResponse(response) {
    console.log(JSON.stringify(response, null, 2));
}
