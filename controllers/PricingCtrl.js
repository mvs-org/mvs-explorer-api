'use strict';

let CMC = require('../models/cmc.js'),
    Message = require('../models/message.js');

module.exports = {
    cmc: cmc,
};

function cmc(req, res) {
    CMC.tickers()
        .then((tickers) => res.json(Message(1, undefined, tickers)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_GET_TICKERS'));
        });
}

