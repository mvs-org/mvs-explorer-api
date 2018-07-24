'use strict';

//Load Models
var Message = require('../models/message.js'),
    Transaction = require('../models/transaction'),
    Block = require('../models/block'),
    Assets = require('../models/assets.js'),
    Mits = require('../models/mits.js'),
    Certs = require('../models/certs.js'),
    Avatars = require('../models/avatars.js'),
    Transaction = require('../models/transaction'),
    Address = require('../models/address.js'),
    Mining = require('../models/mining_pool.js');

exports.Info = info;

function info(req,res){
    var filter_last_day = {
        max_time: Math.floor(new Date()/1000),
        min_time: Math.floor(new Date()/1000 - (60*60*24))
    };
    Block.height()
        .then((height) => {
            return Promise.all([height, Block.fetch(height), Block.fetch(height - 1000), Assets.countassets(), Mits.countmits(), Certs.countcerts(), Avatars.countavatars(), Transaction.counttxs(filter_last_day), Transaction.counttxs({}), Address.countaddresses(0.00000001), Mining.poolstats(height - 1000, height)])
        })
        //
        //
        .then((results) => {
            var info = {}
            info.height = results[0];
            info.hashrate = parseInt(results[1].bits);
            info.last_1000_avg_block_time = (results[1].time_stamp - results[2].time_stamp)/1000;
            info.mst_count = results[3];
            info.mit_count = results[4];
            info.cert_count = results[5];
            info.avatar_count = results[6];
            info.last_day_transactions = results[7];
            info.total_transactions_count = results[8];
            info.addresses_has_balance = results[9];
            info.top_3_mining_pool_percentage = [results[10][0].finds/1000*100, results[10][1].finds/1000*100, results[10][2].finds/1000*100];
            return info
        })
        .then((info) => res.json(Message(1, undefined, info)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_GET_INFO')));
}
