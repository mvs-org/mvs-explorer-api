const CoinGecko = require('../models/coingecko');

CoinGecko.tickers().then(console.log)