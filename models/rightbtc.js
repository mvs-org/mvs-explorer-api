let requestify = require('requestify');

module.exports = {
    ticker: ticker,
    last: last
};

function ticker(target = "ETP", base = "USD") {
    return requestify.get(`https://www.rightbtc.com/api/public/ticker/${target}${base}`)
        .then(function(response) {
            response = response.getBody()
            if (!response.status.success) throw 'ERR_PRICING_PARSING'
            return response.result
        })
}

function last(target = "ETP", base = "USD") {
    return ticker(target, base)
        .then(ticker=>ticker.last / 1E8)
}
