let Fullnode = require('../models/fullnode.js');
let Message = require('../models/message.js');

module.exports = {
    version: version
};

function version(req, res) {
    Fullnode.version()
        .then((version) => {
            res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=600')
            res.json(version);
        })
        .catch((error) => {
            console.error(error);
            res.json(Message(0, 'ERR_FULLNODE_VERSIONS'));
        });
}
