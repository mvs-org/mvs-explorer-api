'use strict';

//Set up database
var mysql = require('mysql');
var config = require('../config/mysql.js');
var connection = mysql.createConnection(config.db);
var mongo = require('../libraries/mongo.js');


module.exports = {
    listTxsByAddress: listTxsByAddress,
    fetch: fetch,
    locksum: locksum,
    circulation: circulation,
    rewards: rewards
};

/**
 * Get transaction data for given hash
 * @param {} hash
 * @returns {}
 */
function fetch(hash) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').find({
                    "hash": hash
                }).toArray((err, docs) => {
                    if (err || docs.length !== 1) {
                        console.error(err, number);
                        throw Error("ERROR_FETCH_TX");
                    } else {
                        resolve(docs[0]);
                    }
                });
            });
    });
}


/**
 * List transactions of given address
 * @param {} address
 * @returns {}
 */
function listTxsByAddress(address, page, num) {
    return new Promise((resolve, reject) => {
        var sql = "SELECT SQL_CALC_FOUND_ROWS `tx`.`id`,`tx`.`block_height`,`tx`.`hash` FROM `tx` JOIN `tx_input` ON `tx`.`id`=`tx_input`.`tx_id` JOIN `address` as `input_address` ON `tx_input`.`address_id`=`input_address`.`id` AND `input_address`.`address`=? JOIN `tx_output` ON `tx_output`.`tx_id`=`tx`.`id` JOIN `address` as `output_address` ON `tx_output`.`address_id`=`output_address`.`id` AND `output_address`.`address`=?  GROUP BY `tx`.`id` ORDER BY `tx`.`block_height` DESC LIMIT ?,?";
        connection.query(sql, [address, address, page * num, num], (error, result) => {
            if (error) {
                console.log(error);
                reject(Error("ERR_FETCH_TRANSACTIONS"));
            } else {
                connection.query('SELECT FOUND_ROWS() as count;', (err, res) => {
                    if (error) {
                        console.log(error);
                        reject(Error("ERR_FETCH_TRANSACTIONS"));
                    } else {
                        resolve({
                            transactions: result,
                            count: res[0].count,
                            items_per_page: num
                        });
                    }
                });
            }

        });
    });
}

function locksum(height) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').mapReduce(function() {
                    this.outputs.forEach((output) => {
                        if (this.height + output.lock_height > height && this.height < height) emit(output.asset.symbol, parseInt(output.quantity));
                    });
                }, function(name, quantity) {
                    return Array.sum(quantity);
                }, {
                    out: "locksum",
                    query: {
                        "outputs.lock_height": {
                            $gt: 0
                        }
                    }
                });
                db.collection('locksum').find().toArray((err, docs) => {
                    if (err || docs.length !== 1) {
                        console.error(err);
                        throw Error("ERROR_FETCH_LOCKSUM");
                    } else
                        resolve(docs[0].value);
                });
            });
    });
}

function rewards(height) {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').mapReduce(function() {
                    this.outputs.forEach((output) => {
                        if (this.inputs.length == 1 && this.inputs[0].address == "") {
                            if (this.height + output.lock_height > height && this.height < height) emit('locked', parseInt(output.quantity));
                            else if (output.lock_height > 0) emit('unlocked', parseInt(output.quantity));
                        }
                    });
                }, function(name, quantity) {
                    return Array.sum(quantity);
                }, {
                    out: "rewards",
                    query: {
                        "outputs.lock_height": {
                            $gt: 0
                        }
                    }
                });
                db.collection('rewards').find().toArray((err, docs) => {
                    if (err) {
                        console.error(err);
                        throw Error("ERROR_FETCH_REWARDS");
                    } else {
                        let res = {};
                        if (docs.length)
                            docs.forEach((e) => {
                                res[e._id] = e.value;
                            });
                        resolve(res);
                    }
                });
            });
    });
}

function circulation() {
    return new Promise((resolve, reject) => {
        mongo.connect()
            .then((db) => {
                db.collection('tx').mapReduce(function() {
                    if (this.inputs[0].previous_output.hash == "0000000000000000000000000000000000000000000000000000000000000000")
                        this.outputs.forEach(function(output) {
                            if (output.locked_height_range)
                                emit("deposit", output.value);
                            else
                                emit("block", output.value);
                        });
                }, function(name, quantity) {
                    return Array.sum(quantity);
                }, {
                    out: "rewards",
                    query: {
                        "inputs.previous_output.hash": "0000000000000000000000000000000000000000000000000000000000000000",
                        "orphan": 0
                    }
                }, (err, tmp) => {
                    if (err) {
                        console.error(err);
                        throw Error("ERROR_FETCH_CIRCULATION");
                    } else {
                        tmp.find().toArray((err, result) => {
                            if (err) {
                                console.error(err);
                                throw Error("ERROR_FETCH_CIRCULATION");
                            } else {
                                resolve({
                                    block: result[0].value,
                                    deposit: result[1].value
                                });
                            }
                        });
                    }
                });
            });
    });
}
