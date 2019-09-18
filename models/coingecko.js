let requestify = require('requestify');
let dnaRightBtcResponse = {}

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
    return requestify.get(`https://api.coingecko.com/api/v3/simple/price?ids=metaverse-etp%2Czengold%2Cbitcoin&vs_currencies=${bases.join('%2C')}`)
        .then(result => result.getBody())
        .then(result => {
            const res = { ETP: {}, "MVS.ZGC": {}, };
            Object.entries(result['metaverse-etp']).forEach(([currency, price]) => res['ETP'][currency.toUpperCase()] = { price, })
            Object.entries(result.zengold).forEach(([currency, price]) => res['MVS.ZGC'][currency.toUpperCase()] = { price, })
            return requestify.get(`https://api.rightbtc.pro/v1/pub/ticker/DNAUSDT`)
                .then(dna => dna.getBody())
                .then(dna => {
                    dnaRightBtcResponse = dna
                    res.DNA = {}
                    Object.entries(result.bitcoin).forEach(([currency, price]) => res['DNA'][currency.toUpperCase()] = { price: price/result.bitcoin.usd*dna.ticks/1000000, })
                    return res
                })
                .catch((error) => {
                    console.error(error)
                    if(dnaRightBtcResponse.ticks) {
                        res.DNA = {}
                        Object.entries(result.bitcoin).forEach(([currency, price]) => res['DNA'][currency.toUpperCase()] = { price: price/result.bitcoin.usd*dnaRightBtcResponse.ticks/1000000, })
                    }
                    return res
                });
            
        })
}