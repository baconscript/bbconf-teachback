var AmpersandModel = require('ampersand-model');

module.exports = AmpersandModel.extend({
    props: {
        route_id: ['string', true, '-1'],
        trip_id: ['string', true, '-1'],
        trip_name: ['string', true, 'Aww yea, train ride!!'],
        trip_headsign: ['string', true, 'that-a-way'],
        vehicle_id: ['string', true, '-1'],
        vehicle_lat: ['string', true, "42.3506"],
        vehicle_lon: ['string', true, "-71.05569"],
        vehicle_bearing: ['string', true, "-71.05569"],
        vehicle_timestamp: ['string', true, "1424145011"],
        stop_name: ['string', true, '_STATION_'],
        pre_away: ['string', true, '999s']
    },
    session: {

    },
    derived: {
        fullName: {
            deps: ['trip_headsign', 'trip_id'],
            fn: function () {
                return this.trip_headsign + ' ' + this.trip_id;
            }
        },

        avatar: {
            fn: function () {
                return '/t.jpg';
            }
        },

        viewMapUrl: {
            fn: function() {
                return 'http://maps.google.com/?q=' + this.coords.join();
            }
        },

        coords: {
            fn: function() {
                return [this.vehicle_lat, this.vehicle_lon];
            }
        },

        locationDetailed: {
            fn: function () {
                return '[' + this.coords.concat(this.vehicle_bearing + '°').join(', ') + '] - vehicle '
                    + this.vehicle_id + ' @ ' + this.vehicle_timestamp;
            }
        },

        summary: {
            fn: function () {
                return 'next, ' + this.stop_name + ' in ' + this.pre_away + 's.';
            }
        }
    }
});
