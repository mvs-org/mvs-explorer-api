'use strict';

var Bitfinex = require('../models/bitfinex.js'),
    CMC = require('../models/cmc.js'),
    Rightbtc = require('../models/rightbtc.js'),
    Message = require('../models/message.js');

module.exports = {
    cmc: cmc,
    ethswaprate: ethSwapRate,
};

function cmc(req, res) {
    CMC.tickers()
        .then((tickers) => res.json(Message(1, undefined, tickers)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_GET_TICKERS'));
        });
}

function ethSwapRate(req, res) {
    Promise.all([
            Bitfinex.last('ETH', 'USD'),
            Bitfinex.last('ETP', 'USD'),
            Rightbtc.last('ETP', 'USD'),
            Rightbtc.last('ETH', 'USD'),
        ])
        .then(([BF_ETH_USD, BF_ETP_USD, RB_ETP_USD, RB_ETH_USD]) => {
            let BF_ETH_ETP = BF_ETH_USD / BF_ETP_USD
            let RB_ETH_ETP = RB_ETH_USD / RB_ETP_USD

            let ETH_ETP = Math.min(BF_ETH_ETP, RB_ETH_ETP) * rateFactor()

            return parseFloat(ETH_ETP.toFixed(5))
        })
        .then(rate => res.json(Message(1, undefined, rate)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_GET_ETHSWAP_RATE'));
        });
}

function rateFactor(){
    let end_of_all_saints_day = new Date('2018-11-02')
    if ( new Date() <= end_of_all_saints_day)
        return 1
    else
        return .9
}
