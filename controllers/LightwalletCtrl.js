const xml = require('xml'),
    lightwallet = require('../config/lightwallet.js');

module.exports = {
    version: version
};

function version(req, res) {
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600')
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
