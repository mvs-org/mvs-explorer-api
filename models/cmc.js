let requestify = require('requestify');

module.exports = {
    tickers: tickers
};

let assets = ["ETP", "MVS.ZGC"];
let bases = ["BTC", "USD", "CNY", "JPY", "EUR"];

function getQuote(asset, base) {
    let id = 0;
    switch (asset) {
        case "ETP":
            id = 1703;
            break;
        case "MVS.ZGC":
            id = 1695;
            break;
        default:
            throw Error('Error illegal asset for quote query');
    }
    return requestify.get(`https://api.coinmarketcap.com/v2/ticker/${id}/?convert=${base}`)
        .then(result => result.getBody().data.quotes[base]);
}

function tickers() {
    return Promise.all(assets.map(asset => Promise.all(bases.map(base => getQuote(asset, base)))))
        .then(quotes => {
            let result = {};
            assets.forEach((asset, asset_index) => {
                bases.forEach((base, base_index) => {
                    if (result[asset] == undefined)
                        result[asset] = {};
                    result[asset][base] = quotes[asset_index][base_index];
                });
            });
            return result;
        });
}
