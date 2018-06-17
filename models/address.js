'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');
var config = require('../config/config.js');

module.exports = {
    listTxsData: listTxsData,
    listOutputs: listOutputs,
    listInputs: listInputs,
    balances: listBalances,
    suggest: suggest,
    listAddressIds: listAddressIds
};

function listTxsData(address, from, to) {
    return mongo.find({
        $or: [{
            'inputs.address': address
        }, {
            'outputs.address': address
        }],
        "orphan": 0,
        "confirmed_at": {
            $lte: to,
            $gte: from
        }
    }, {
        "_id": 0,
        "rawtx": 0,
        "id": 0,
        "inputs": {
            "$slice": 5
        }
    }, 'tx', {}, true);
}


/**
 * Suggest address.
 * @param {String} prefix
 * @returns {}
 */
function suggest(prefix, limit, includeTxCount) {
    return mongo.connect()
        .then((db) => db.collection('tx'))
        .then((collection) => collection.mapReduce(function() {
            let addresses = new Set();
            if (this.inputs)
                this.inputs.forEach((input) => {
                    if (input && input.address && input.address.startsWith(prefix)) {
                        addresses.add(input.address);
                    }
                });
            if (this.outputs)
                this.outputs.forEach((output) => {
                    if (output && output.address && output.address.startsWith(prefix)) {
                        addresses.add(output.address);
                    }
                });
            addresses.forEach((address) => emit(address, 1));
        }, function(name, quantity) {
            return Array.sum(quantity);
        }, {
            out: {
                inline: 1
            },
            query: {
                $or: [{
                    'inputs.address': {
                        $regex: new RegExp('^' + prefix)
                    }
                }, {
                    'outputs.address': {
                        $regex: new RegExp('^' + prefix)
                    }
                }],
                "orphan": 0
            },
            scope: {
                prefix: prefix
            }
        }))
        .then((result) => {
            result.sort(function(a, b) {
                return b.value - a.value;
            });
            return result.slice(0, limit);
        })
        .then((sorted) => {
            let result = new Array();
            sorted.forEach((item) => (includeTxCount) ? result.push({
                a: item._id,
                n: item.value
            }) : result.push(item._id));
            return result;
        });
}

function listOutputs(address_ids) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('output').find({
                    "address_id": {
                        $in: address_ids
                    }
                }, {
                    "_id": 0
                }).toArray((err, docs) => {
                    resolve(docs);
                });
            });
    });
}


function listInputs(address_ids) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('input').find({
                    "address_id": {
                        $in: address_ids
                    }
                }, {
                    "_id": 0
                }).toArray((err, docs) => {
                    resolve(docs);
                });
            });
    });
}

function listAddressIds(addresses) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('address').find({
                    "address": {
                        $in: addresses
                    }
                }, {
                    "_id": 0
                }).toArray((err, docs) => {
                    if (docs.length == 0)
                        resolve([]);
                    else {
                        var addresses_list = [];
                        Promise.all(docs.map((a) => {
                            addresses_list.push(a.id);
                        })).then(() => resolve(addresses_list));
                    }
                });
            });
    });
}

function listBalances(address, height) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('output').mapReduce(function() {
                            if (this.address == address) {
                                switch (this.attachment.type) {
                                    case 'asset-transfer':
                                    case 'asset-issue':
                                        if (this.attachment.symbol != "ETP")
                                            emit(this.attachment.symbol, this.attachment.quantity);
                                        break;
                                }
                                if (this.value) {
                                    if (this.locked_height_range + this.height < height)
                                        emit("*ETP", this.value);
                                    else
                                        emit("*FROZEN", this.value);
                                }
                            }
                }, function(name, quantity) {
                    return Array.sum(quantity);
                }, {
                    out: {
                        inline: 1
                    },
                    query: {
                        address: address,
                        "spent_tx": 0
                    },
                    scope: {
                        address: address,
                        height: height
                    }
                }, (err, tmp) => {
                    if (err) {
                        console.error(err);
                        throw Error("ERROR_FETCH_BALANCES");
                    } else {
                        let results = {
                            info: {},
                            tokens: {}
                        };
                        tmp.forEach((item) => {
                            if (item._id.startsWith('*'))
                                results['info'][item._id.substring(1)] = item.value;
                            else if (!results[item._id])
                                results['tokens'][item._id] = item.value;
                        });
                        resolve(results);
                    }
                });
            });
    });
}
