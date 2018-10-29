let requestify = require('requestify');

module.exports = {
    ticker: ticker,
    last: last,
};

function ticker(target = "ETP", base = "USD") {
    return requestify.get(`https://api.bitfinex.com/v2/ticker/t${target}${base}`)
        .then(function(response) {
            let result = response.getBody()
            if (!result || result.length < 6) throw 'ERR_PRICING_PARSING'
            return result
        })
}

function last(target = "ETP", base = "USD") {
    return ticker(target, base).then(ticker=>ticker[6])
}
