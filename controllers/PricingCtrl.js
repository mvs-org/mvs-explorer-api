'use strict'

let CoinGecko = require('../models/coingecko'),
    Message = require('../models/message.js')

module.exports = {
    tickers,
}

function tickers(req, res) {
    CoinGecko.tickers()
        .then((tickers) => res.json(Message(1, undefined, tickers)))
        .catch((error) => {
            console.error(error)
            res.status(400).json(Message(0, 'ERR_GET_TICKERS'))
        })
}
