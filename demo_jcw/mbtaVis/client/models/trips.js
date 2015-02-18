var Collection = require('ampersand-rest-collection');
var Trip = require('./trip');

module.exports = Collection.extend({
    model: Trip,
    baseUrl: '/api/trips/'
});

