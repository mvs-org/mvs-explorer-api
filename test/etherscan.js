let etherscan = require('../models/etherscan.js')

etherscan.getETHBalance('0xc1e5fd24fa2b4a3581335fc3f2850f717dd09c86')
    .then(console.log)
