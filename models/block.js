'use strict';

//Set up database
var mongo = require('../libraries/mongo.js');
var mysql = require('mysql');
var config = require('../config/mysql.js');
var connection = mysql.createConnection(config.db);

exports.height = height;
exports.list = list;
exports.circulation = circulation;
exports.fetch = fetch;
exports.list_block_txs = list_block_txs;

function circulation(number) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT sum_output.value-sum_input.value AS circulation FROM sum_input,sum_output;";
        connection.query(sql, (error, result, fields) => {
            if (error || result.length !== 1) {
                console.log(error);
                reject(Error("ERR_FETCH_BLOCK"));
            } else {
                resolve(result[0].circulation);
            }
        });
    });
}

function fetch(number) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('block').find({
                    "number": number,
                    "orphan": 0
                }, {
                    "_id": 0
                }).toArray((err, docs) => {
                    if (err || docs.length !== 1) {
                        console.error(err);
                        throw Error("ERR_FETCH_BLOCK");
                    } else
                        resolve(docs[0]);
                });
            });
    });
}


function list_block_txs(blockhash) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                return db.collection('tx').find({
                    "block": blockhash
                }, {
                    "_id": 0,
                    "id": 0,
                    "rawtx": 0,
                    "inputs": {
                        "$slice": 5
                    }
                }).toArray((err, txs) => {
                    if (err) {
                        console.error(err);
                        throw Error("ERR_FETCH_BLOCK_TRANSACTIONS");
                    } else
                        resolve(txs);
                });
            });
    });
}

/**
 * List blocks
 * @param {} page
 * @param {} num Number of blocks per page
 * @returns {} 
 */
function list(page, num) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                return db.collection('block').find({orphan: 0}, {
                    "_id": 0
                }).skip(page*num).limit(num).toArray((err, blocks) => {
                    if (err) {
                        console.error(err);
                        throw Error("ERR_FETCH_BLOCKS");
                    } else
                        resolve(blocks);
                });
            });
    });
}

/**
 * Get current height
 * @returns {} 
 */
function height() {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('block')
                    .find()
                    .sort({
                        number: -1
                    })
                    .limit(1)
                    .toArray((err, docs) => {
                        if (err || docs.length !== 1) {
                            console.error(err);
                            throw Error("ERR_FETCH_HEIGHT");
                        } else
                            resolve(docs[0].number);
                    });
            });
    });
}
