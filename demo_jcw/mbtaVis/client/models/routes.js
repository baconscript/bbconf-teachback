var Collection = require('ampersand-rest-collection');
var Route = require('./route');


module.exports = Collection.extend({
    model: Route,
    url: '/api/routes'
});
