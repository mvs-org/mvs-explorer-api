var geoip = require('geoip-lite'),
    requestify = require('requestify');

module.exports={
    list_ips:list_ips,
    lookup: lookup
};

/**
 * Returns a list of ip addresses on the metaverse network.
 * @returns {} 
 */
function list_ips (){
    return requestify.get('http://vpn2.viewfin.com:9999/monitorPeer')
        .then((response)=>{
            if(response.getBody().success){
                let seedlist=[];
                let seeds = response.getBody().dataWrapper.seeds;
                if(Array.isArray(seeds)&&seeds.length){
                    seeds.forEach((seed)=>{
                        if(seed.status !=-1){
                            seedlist.push(seed.host);
                        }
                    });
                }
                return seedlist;
            } else{
                throw Error('ERR_NODELIST_RESULT');
            }
        });
}

/**
 * Gets the geo infomation on the specified ip address.
 * @param {String} ip
 * @returns {} 
 */
function lookup(ip){
    return new Promise((resolve,reject)=>{
        let info=geoip.lookup(ip);
        resolve({
            country: info.country,
            city: info.city,
            lat: info.ll[0],
            lng: info.ll[1]
        });
    });
}
