let rightbtc = require('../models/rightbtc.js')

rightbtc.last('ETP','ETH')
    .then(console.log)
