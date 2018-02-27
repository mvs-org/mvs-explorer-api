'use strict';

var Bitfinex = require('../models/bitfinex.js'),
    Message = require('../models/message.js');

module.exports = {
    tickers: tickers
};

function tickers(req, res) {
    Bitfinex.tickers()
        .then((tickers) => res.json(Message(1, undefined, tickers)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}
