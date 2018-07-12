'use strict';

var Bitfinex = require('../models/bitfinex.js'),
    CMC = require('../models/cmc.js'),
    Message = require('../models/message.js');

module.exports = {
    tickers: bitfinex,
    cmc: cmc
};

function bitfinex(req, res) {
    Bitfinex.tickers()
        .then((tickers) => res.json(Message(1, undefined, tickers)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}

function cmc(req, res) {
    CMC.tickers()
        .then((tickers) => res.json(Message(1, undefined, tickers)))
        .catch((error) => res.status(404).json(Message(0, error.message)));
}
