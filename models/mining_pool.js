let requestify = require('requestify');

//Set up database
var mongo = require('../libraries/mongo.js');

module.exports = {
    poolstats: poolstats,
    pools: pools,
    posstats: posstats
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
            .then((db) => {
                db.collection('block').aggregate([{
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
                });
            });
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
    });
}