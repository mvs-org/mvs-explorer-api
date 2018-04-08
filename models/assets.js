'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');


module.exports = {
    listassets: listassets,
    assetinfo: assetinfo
};

/**
 * Get the list of all the assets.
 * @param {} hash
 * @returns {}
 */
function listassets(hash) {
  return new Promise((resolve, reject) => {
      mongo.connect()
          .then((db) => {
              db.collection('asset').find({

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
 * Get the information of an asset.
 * @param {} hash
 * @returns {}
 */
function assetinfo(symbol) {
  return new Promise((resolve, reject) => {
      mongo.connect()
          .then((db) => {
              db.collection('asset').find({
                  "symbol": symbol
              }, {
                  "_id": 0,
                  "type": 0
              }).toArray((err, docs) => {
                  resolve(docs);
              });
          });
  });
}
