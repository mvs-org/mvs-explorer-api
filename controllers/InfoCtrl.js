'use strict';

//Load Models
var Message = require('../models/message.js'),
    Transaction = require('../models/transaction'),
    Block = require('../models/block'),
    Assets = require('../models/assets.js'),
    Mits = require('../models/mits.js'),
    Certs = require('../models/certs.js'),
    Avatars = require('../models/avatars.js'),
    Address = require('../models/address.js'),
    Mining = require('../models/mining_pool.js');

exports.Info = info;

function info(req, res) {
    var filter_last_day = {
        max_time: Math.floor(new Date() / 1000),
        min_time: Math.floor(new Date() / 1000 - (60 * 60 * 24))
    };
    Block.height()
        .then((height) => Promise.all([
            height,
            Block.fetch(height),
            Block.fetch(Math.max(height - 100, 1)),
            Assets.countassets(),
            Mits.countmits(),
            Certs.countcerts(),
            Avatars.countavatars(),
            Transaction.counttxs(filter_last_day),
            Transaction.counttxs({}),
            Address.countaddresses(0.00000001),
            Transaction.circulation(),
            Transaction.locksum(height),
            Mining.pools(),
            Mining.poolstats(Math.max(height - 1000, 1), height),
            Block.fetch(Math.max(height - 1000, 1))
        ]))
        .then((results) => {
            var info = {};
            info.height = results[0];
            info.difficulty = parseInt(results[1].bits);
            info.hashrate = Math.floor(results[1].bits / (results[1].time_stamp - results[2].time_stamp) * 100);
            info.blocktime = (results[1].time_stamp - results[14].time_stamp) / 1000;
            info.counter = {};
            info.counter.mst = results[3];
            info.counter.mit = results[4];
            info.counter.cert = results[5];
            info.counter.avatar = results[6];
            info.counter.transactions_24h = results[7];
            info.counter.total_transactions = results[8];
            info.counter.addresses_with_balance = results[9];
            info.etp = {};
            info.etp.total_supply = results[10];
            info.etp.locksum = results[11] / 100000000;
            let pools = [];
            return Promise.all(results[12].map((pool) => {
                    let pool_display = {};
                    pool_display.share = 0;
                    pool_display.name = pool.name;
                    Promise.all(results[13].map((stat) => {
                            if (pool.addresses.indexOf(stat._id) !== -1)
                                pool_display.share += stat.finds;
                        }))
                        .then(() => {
                            if (pool_display.share) {
                                pool_display.share = parseFloat((pool_display.share / 1000 * 100).toFixed(1));
                                pools.push(pool_display);
                            }
                        });
                }))
                .then(() => {
                    pools.sort(function(a, b) {
                        return b.share - a.share;
                    });
                    info.top_mining_pool = pools.slice(0, 3);
                    return info;
                });
        })
        .then((info) => res.json(Message(1, undefined, info)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_GET_INFO'));
        });
}
