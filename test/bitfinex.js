let bitfinex = require('../models/bitfinex.js')

bitfinex.ticker('ETH','USD')
    .then(console.log)
