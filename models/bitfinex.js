let requestify=require('requestify');

module.exports = {
    tickers: tickers
};

function tickers() {
    return new Promise((resolve, reject) => {
        requestify.get('https://api.bitfinex.com/v2/ticker/tETPUSD')
            .then(function(response) {
                let result = response.getBody();
                if(result.length)
                    resolve({
                        'ETPUSD': result[6]
                    });
                else{
                    reject(Error('ERR_PRICING_PARSING'));
                }
            })
            .catch((error)=>{
                console.error(error);
                reject(Error('ERR_LOAD_PRICING'))
            })
    });
}
