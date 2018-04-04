let requestify = require('requestify');

//Set up database
var mongo = require('../libraries/mongo.js');

module.exports = {
    poolstats: poolstats,
    pools: pools
};

function pools(){
    return mongo.connect()
        .then((db)=>db.collection('pool'))
        .then((pool)=>pool.find({},{_id:0}))
        .then((cursor)=>cursor.toArray());
}

function poolstats(from, to) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').aggregate([{
                    $match: {
                        "height": {
                            "$gt": from,
                            "$lt": to
                        },
                        "orphan": 0,
                        "inputs.0.previous_output.hash": "0000000000000000000000000000000000000000000000000000000000000000",
                        "outputs.0.locked_height_range": 0
                    }
                }, {
                    $project: {
                        firstoutput: {
                            $arrayElemAt: ["$outputs", 0]
                        }
                    }
                }, {
                    $project: {
                        address: "$firstoutput.address"
                    }
                }, {
                    $group: {
                        _id: "$address",
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
