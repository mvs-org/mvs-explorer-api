let requestify = require('requestify');

module.exports = {
    tickers: tickers
};

let bases = [
    "BTC",
    "USD",
    "CNY",
    "JPY",
    "EUR",
    "GBP",
    "CAD",
];

function tickers() {
    return requestify.get(`https://api.coingecko.com/api/v3/simple/price?ids=metaverse-etp%2Czengold&vs_currencies=${bases.join('%2C')}`)
        .then(result => result.getBody())
        .then(result => {
            const res = { ETP: {}, "MVS.ZGC": {}, };
            Object.entries(result['metaverse-etp']).forEach(([currency, price]) => res['ETP'][currency.toUpperCase()] = { price, })
            Object.entries(result.zengold).forEach(([currency, price]) => res['MVS.ZGC'][currency.toUpperCase()] = { price, })
            return res
        })
}