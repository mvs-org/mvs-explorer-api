let Geo = require('../models/geo.js');
let Message = require('../models/message.js');
let GeoJSON = require('geojson');

module.exports = {
    locations: locations
};

function locations(req, res) {
    Geo.list_ips()
        .then((ips) => Promise.all(ips.map((ip) => Geo.lookup(ip))))
        .then((locations) => {
            let gjson = GeoJSON.parse(locations, {
                Point: ['lat', 'lng']
            });
            res.json(gjson);
        })
        .catch((error) => {
            console.error(error);
            res.json(Message(0, 'ERR_LIST_NODES'));
        });
}
