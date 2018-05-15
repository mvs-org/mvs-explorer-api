'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listcerts: listcerts,
    certsinfo: certsinfo
};

/**
 * Get the list of all the assets.
 * @param {} hash
 * @returns {}
 */
function listcerts() {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('output').find({
                    'attachment.type': "asset-cert",
                    orphaned_at: 0
                }, {
                    "_id": 0,
                    "type": 0
                }).toArray((err, docs) => {
                    resolve(docs);
                });
            });
    });
}

/**
 * Get the information of an avatar.
 * @param {} hash
 * @returns {}
 */
function certsinfo(owner) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('output').find({
                    'attachment.type': "asset-cert",
                    'attachment.owner': owner,
                    orphaned_at: 0
                }, {
                    "_id": 0,
                    "type": 0
                }).toArray((err, docs) => {
                    resolve(docs);
                });
            });
    });
}
