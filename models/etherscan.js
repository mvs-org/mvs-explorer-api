const requestify = require('requestify');

// const etherscan = new Etherscan();

// requestify.get()

const ADDRESS = '0xc1e5fd24fa2b4a3581335fc3f2850f717dd09c86'
const ETHERSCAN_KEY = undefined

module.exports = {
    getETHBalance,
    getERC20Balance
}

function getERC20Balance(address, contract_address) {
    return requestify.get(`https://api.etherscan.io/api\?module\=account\&action\=tokenbalance\&contractaddress\=${contract_address}\&address\=${address}\&tag\=latest\&apikey\=${ETHERSCAN_KEY}`)
        .then(res => res.getBody())
        .then(res => res.result / 1E18)
}

function getETHBalance(address) {
    return requestify.get(`https://api.etherscan.io/api\?module\=account\&action\=balance\&address\=${address}\&tag\=latest\&apikey\=${ETHERSCAN_KEY}`)
        .then(res => res.getBody())
        .then(res => res.result / 1E18)
}
