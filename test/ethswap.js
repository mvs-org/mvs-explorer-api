let bitfinex = require('../models/bitfinex.js')
let rightbtc = require('../models/rightbtc.js')

Promise.all([
        bitfinex.last('ETH', 'USD'),
        bitfinex.last('ETP', 'USD'),
        rightbtc.last('ETP', 'USD'),
        rightbtc.last('ETH', 'USD'),
    ])
    .then(([BF_ETH_USD, BF_ETP_USD, RB_ETP_USD, RB_ETH_USD]) => {
        let BF_ETH_ETP = BF_ETH_USD / BF_ETP_USD
        let RB_ETH_ETP = RB_ETH_USD / RB_ETP_USD

        let ETH_ETP = Math.min(BF_ETH_ETP, RB_ETH_ETP) * rateFactor()

        return ETH_ETP
    })
    .then(console.log)

function rateFactor(){
    let end_of_all_saints_day = new Date('2018-11-02')
    if ( new Date() <= end_of_all_saints_day)
        return 1
    else
        return .9
}
