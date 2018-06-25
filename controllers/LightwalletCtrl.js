const xml = require('xml'),
    lightwallet = require('../config/lightwallet.js');

module.exports = {
    version: version
};

function version(req, res) {
    console.log(xml(lightwallet));
    res.set('Content-Type', 'text/xml');
    res.send(xml({
        update: [{
                version: lightwallet.version
            },
            {
                name: lightwallet.name
            },
            {
                url: lightwallet.url
            }
        ]
    }));
}
