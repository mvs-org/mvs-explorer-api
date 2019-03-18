let requestify = require('requestify');

//Set up database
var mongo = require('../libraries/mongo.js');

module.exports = {
    poolstats: poolstats,
    pools: pools,
    posstats: posstats,
    posVotesCount: posVotesCount,
};

function pools(){
    return mongo.connect()
        .then((db)=>db.collection('pool'))
        .then((pool)=>pool.find({},{_id:0}))
        .then((cursor)=>cursor.toArray());
}

function poolstats(interval) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => db.collection('block').aggregate([{
                    $match: {
                        "version": 1,
                        "orphan": 0
                    }
                }, {
                    $sort: {
                        number: -1
                    }
                }, {
                    $limit: interval
                }, {
                    $group: {
                        _id: "$miner",
                        'finds': {
                            $sum: 1
                        }
                    }
                }, {
                    $sort: {
                        finds: -1
                    }
                }], {}, (err, result) => {
                    resolve(result);
                })
            )
    });
}

function posstats(interval) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('block').aggregate([{
                    $match: {
                        "version": 2,
                        "orphan": 0
                    }
                }, {
                    $sort: {
                        number: -1
                    }
                }, {
                    $limit: interval
                }, {
                    $group: {
                        _id: "$miner",
                        address: {
                            $first: "$miner_address",
                        },
                        'finds': {
                            $sum: 1
                        }
                    }
                }, {
                    $sort: {
                        finds: -1
                    }
                }], {}, (err, result) => {
                    resolve(result);
                });
            });
        })
}

function posVotesCount(addresses, height) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('output').aggregate([{
                    $match: {
                        orphaned_at: 0,
                        address: { $in: addresses },
                        spent_tx: 0,
                        value: { $gte: 1000E8 }
                    }
                }, {
                    $sort: {
                        number: -1
                    }
                },
                {
                    $project: {
                        address: 1,
                        value: 1,
                        waiting: { $cond: [{$gt: ['$height', height-1000]}, 1, 0]}
                    }
                }, {
                    $group: {
                        _id: "$address",
                        max: {
                            $max: "$value",
                        },
                        pendingVotes: {
                            $sum: "$waiting"
                        },
                        totalVotes: {
                            $sum: 1
                        }
                    }
                }, {
                    $sort: {
                        count: -1
                    }
                }], {}, (err, result) => {
                    resolve(result);
                });
            });
    });
}