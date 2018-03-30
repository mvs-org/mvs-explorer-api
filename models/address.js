'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');
var config = require('../config/config.js');

module.exports = {
    listTxsData: listTxsData,
    listTxsDataCounted: listTxsDataCounted,
    listOutputs: listOutputs,
    listInputs: listInputs,
    listAddressIds: listAddressIds
};

function listTxsData(address) {
    return mongo.find({
        $or: [{
            'inputs.address': address
        }, {
            'outputs.address': address
        }]
    }, {
        "_id": 0,
        "id": 0
    }, 'tx', {
        height: -1
    }, true);
}


function listTxsDataCounted(address, page, items_per_page) {
    return mongo.find_and_count({
        $or: [{
            'inputs.address': address
        }, {
            'outputs.address': address
        }]
    }, {
        "_id": 0,
        "rawtx": 0,
        "inputs": {
            "$slice": 5
        }
    }, 'tx', {
        "height": -1
    }, page, items_per_page);
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
