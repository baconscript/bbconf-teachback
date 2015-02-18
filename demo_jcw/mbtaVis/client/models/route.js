var AmpersandModel = require('ampersand-model');

module.exports = AmpersandModel.extend({
    props: {
        id: ['string', true, ''],
        route_name: ['string', true, ''],
        mode_name: ['string', true, ''],
        direction: ['string', true, ''],
        alerts: ['string', true, 'No alerts!']
    },
    session: {
        selected: ['boolean', true, false]
    },
    derived: {
        fullName: {
            deps: ['route_name', 'id'],
            fn: function () {
                return this.route_name + ' ' + this.id;
            }
        },

        avatar: {
            deps: ['route_name'],
            fn: function () {
                return 'background: ' + this.route_name.split(' ')[0];
            }
        },

        viewTripsUrl: {
            deps: ['id'],
            fn: function () {
                return '/trips/' + this.id;
            }
        },

        viewRouteUrl: {
            deps: ['id'],
            fn: function () {
                return '/route/' + this.id;
            }
        },

        details: {
            deps: ['mode_name', 'direction'],
            fn: function () {
                return this.mode_name + ', ' + this.direction;
            }
        }
    }
});
