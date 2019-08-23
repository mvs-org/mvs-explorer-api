'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    get: cert,
    listcerts: listcerts,
    countcerts: countcerts,
    certsinfo: certsinfo,
    listMstMining,
};

/**
 * Get the list of all the assets.
 * @param {boolean} show_invalidated include invalidated certs
 * @returns {Array<Output>}
 */
function listcerts(show_invalidated, page, items_per_page) {
    let query = {
        'attachment.type': "asset-cert",
        orphaned_at: 0
    };
    if(!show_invalidated){
        query.spent_tx = 0;
    }
    return mongo.find_and_count(query, {_id:0, type: 0}, 'output', {"height": -1}, page, items_per_page);
}

/**
 * Count all the certs.
 * @returns {number}
 */
function countcerts() {
    let query = {
        'attachment.type': "asset-cert",
        orphaned_at: 0,
        spent_tx: 0
    };
    return mongo.connect()
        .then((db) => db.collection('output'))
        .then(collection => collection.count(query, {}))
}

/**
 * Get the information of a certificate.
 * @param {string} type type
 * @param {string} symbol symbol
 * @returns {Array<Output>}
 */
function cert(type, symbol) {
    let query = {
        'attachment.type': "asset-cert",
        spent_tx: 0,
        'attachment.cert': type,
        'attachment.symbol': symbol,
    };
    return mongo.connect()
        .then((db) => db.collection('output'))
        .then(collection => collection.find(query, {
            "_id": 0,
            "type": 0
        }))
        .then(cursor => cursor.toArray());
}

/**
 * Get the information of an avatar.
 * @param {string} owner did symbol of owner
 * @param {boolean} show_invalidated include invalidated certs
 * @returns {Array<Output>}
 */
function certsinfo(owner, show_invalidated) {
    let query = {
        'attachment.type': "asset-cert",
        orphaned_at: 0,
        'attachment.owner': owner
    };
    if(!show_invalidated){
        query.spent_tx = 0;
    }
    return mongo.connect()
        .then((db) => db.collection('output'))
        .then(collection => collection.find(query, {
            "_id": 0,
            "type": 0
        }))
        .then(cursor => cursor.toArray());
}

/**
 * Get the full list of MST that can be mined.
 * @returns {Array<Output>}
 */
function listMstMining() {
    let query = {
        'attachment.type': "asset-cert",
        'attachment.cert': "mining",
        orphaned_at: 0
    };
    return mongo.connect()
        .then((db) => db.collection('output'))
        .then(collection => collection.find(query, {
            "_id": 0,
            "type": 0
        }))
        .then(cursor => cursor.toArray());
}
