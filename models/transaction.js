'use strict';

//Set up database
var mysql = require('mysql');
var config = require('../config/mysql.js');
var connection = mysql.createConnection(config.db);
var mongo = require('../libraries/mongo.js');


module.exports = {
    listTxsByAddress: listTxsByAddress,
    listTxsByBlock: listTxsByBlock,
    listOutputsByTx: listOutputsByTx,
    listInputsByTx: listInputsByTx,
    fetch: fetch,
    fetch_mongo: fetch_mongo,
    locksum: locksum,
    rewards: rewards,
    includeTransactionData: includeTransactionData
};

/**
 * Get transaction data for given hash
 * @param {} hash
 * @returns {} 
 */
function fetch (hash) {
    return new Promise( (resolve, reject) => {
        var sql = "SELECT `tx`.`id`,`tx`.`block_height`,`tx`.`hash` FROM `tx` WHERE `hash`= ?;";
        connection.query(sql, [hash], (error, result) => {
            if (error || result.length !== 1) {
                console.log(error);
                reject(Error("ERR_FETCH_TRANSACTION"));
            } else {
                resolve(result[0]);
            }
        });
    });
}

/**
 * List all transactions of given block
 * @param {} block_no Height of block
 * @returns {} 
 */
function listTxsByBlockMongo (block_no) {
    return new Promise( (resolve, reject) => {
        var sql = "SELECT `tx`.`id`,`tx`.`block_height`,`tx`.`hash` FROM `tx` WHERE `block_height`= ?;";
        connection.query(sql, [block_no], (error, result) => {
            if (error) {
                console.error(error);
                reject(Error("ERR_FETCH_TRANSACTIONS"));
            } else {
                resolve(result);
            }
        });
    });
}
/**
 * List all transactions of given block
 * @param {} block_no Height of block
 * @returns {} 
 */
function listTxsByBlock (block_no) {
    return new Promise( (resolve, reject) => {
        var sql = "SELECT `tx`.`id`,`tx`.`block_height`,`tx`.`hash` FROM `tx` WHERE `block_height`= ?;";
        connection.query(sql, [block_no], (error, result) => {
            if (error) {
                console.error(error);
                reject(Error("ERR_FETCH_TRANSACTIONS"));
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * List inputs of given transaction
 * @param {} tx_id Transaction id
 * @returns {} 
 */
function listInputsByTx (tx_id) {
    return new Promise( (resolve, reject) => {
        var sql = "SELECT `tx_input`.`script`,`tx_input`.`tx_value` AS `value`, `tx_input`.`decimal_number` AS `decimals`, `tx_input`.`asset`, `address`.`address` FROM `tx_input` LEFT JOIN `address` ON `tx_input`.`address_id`=`address`.`id` WHERE `tx_input`.`tx_id`= ?;";
        connection.query(sql, [tx_id], (error, result) => {
            if (error) {
                console.error(error);
                reject(Error("ERR_FETCH_INPUTS"));
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * List inputs of given transaction
 * @param {} tx_id
 * @returns {} 
 */
function listOutputsByTx (tx_id) {
    return new Promise( (resolve, reject) => {
        //var sql = "SELECT * FROM (SELECT `tx_output`.`script`, `tx_output`.`output_value` AS `value`, `address`.`address`, `tx_output`.`asset`, `tx_output`.`decimal_number` AS `decimals` FROM `tx_output` LEFT JOIN `address` ON `tx_output`.`address_id`=`address`.`id` WHERE `tx_output`.`tx_id`= ?) AS etp_txo UNION  (SELECT NULL AS `script`, `tx_output_asset`.`output_value`, `address`.`address`, `asset_name` , `tx_output_asset`.`asset_type` AS `decimal_number` FROM `tx_output_asset` LEFT JOIN `address` ON `tx_output_asset`.`address_id`=`address`.`id` WHERE `tx_output_asset`.`tx_id`= ?);";
        var sql = "SELECT `tx_output`.`script`, `tx_output`.`output_value` AS `value`, `address`.`address`, `tx_output`.`asset`, `tx_output`.`decimal_number` AS `decimals` FROM `tx_output` LEFT JOIN `address` ON `tx_output`.`address_id`=`address`.`id` WHERE `tx_output`.`tx_id`= ?;";
        connection.query(sql, [tx_id,tx_id], (error, result) => {
            if (error) {
                console.error(error);
                reject(Error("ERR_FETCH_OUTPUTS"));
            } else {
                resolve(result);
            }
        });
    });
}

/**
 * List transactions of given address
 * @param {} address
 * @returns {} 
 */
function listTxsByAddress (address, page, num) {
    return new Promise( (resolve, reject) => {
        var sql = "SELECT SQL_CALC_FOUND_ROWS `tx`.`id`,`tx`.`block_height`,`tx`.`hash` FROM `tx` JOIN `tx_input` ON `tx`.`id`=`tx_input`.`tx_id` JOIN `address` as `input_address` ON `tx_input`.`address_id`=`input_address`.`id` AND `input_address`.`address`=? JOIN `tx_output` ON `tx_output`.`tx_id`=`tx`.`id` JOIN `address` as `output_address` ON `tx_output`.`address_id`=`output_address`.`id` AND `output_address`.`address`=?  GROUP BY `tx`.`id` ORDER BY `tx`.`block_height` DESC LIMIT ?,?";
        connection.query(sql, [address, address, page*num,num], (error, result) => {
            if (error) {
                console.log(error);
                reject(Error("ERR_FETCH_TRANSACTIONS"));
            } else {
                connection.query('SELECT FOUND_ROWS() as count;', (err, res) => {
                    if (error) {
                        console.log(error);
                        reject(Error("ERR_FETCH_TRANSACTIONS"));
                    } else{
                        resolve({transactions: result, count: res[0].count, items_per_page: num});
                    }
                });
            }

        });
    });
}

/**
 * Adds inputs and outputs to the given transaction.
 * @param {} tx Transaction object (at least property id must be defined)
 * @returns {} Transaction object with in and outputs
 */
function includeTransactionData (tx) {
    return new Promise( (resolve, reject) => {
        Promise.all([listInputsByTx(tx.id), listOutputsByTx(tx.id)])
            .then( (results) => {
                tx.inputs=results[0];
                tx.outputs=results[1];
                resolve(tx);
            })
            .catch( (error) => reject(Error(error.message)) );
    });
}

function locksum (height) {
    return new Promise((resolve,reject)=>{
        mongo.connect()
            .then((db)=>{
db.collection('tx').mapReduce(function(){this.outputs.forEach((output)=>{if(this.height+output.lock_height>height&&this.height<height) emit(output.asset.symbol,parseInt(output.quantity));})}, function(name,quantity){return Array.sum(quantity);},  { out: "locksum", query: {"outputs.lock_height": {$gt:0}} } )
db.collection('locksum').find().toArray((err,docs)=>{
                    if(err || docs.length!==1){
                        console.error(err, number);
                        throw Error("ERROR_FETCH_LOCKSUM");
                    }
                    else
                        resolve(docs[0].value);
                });
            });
    });
}

function rewards (height) {
    return new Promise((resolve,reject)=>{
        mongo.connect()
            .then((db)=>{
db.collection('tx').mapReduce(function(){this.outputs.forEach((output)=>{if(this.inputs.length==1&&this.inputs[0].address==""){if(this.height+output.lock_height>height&&this.height<height) emit('locked',parseInt(output.quantity)); else if(output.lock_height>0) emit('unlocked',parseInt(output.quantity)); } })}, function(name,quantity){return Array.sum(quantity);},  { out: "rewards", query: {"outputs.lock_height": {$gt:0}} } )
db.collection('rewards').find().toArray((err,docs)=>{
                    if(err){
                        console.error(err);
                        throw Error("ERROR_FETCH_REWARDS");
                    }
                    else{
                        let res = {};
                        if(docs.length)
                        docs.forEach((e)=>{res[e._id]=e.value});
                        resolve(res);
                    }
                });
            });
    });
}

function fetch_mongo (hash) {
    return new Promise((resolve,reject)=>{
        mongo.connect()
            .then((db)=>{
db.collection('tx').find({"hash":hash}).toArray((err,docs)=>{
                    if(err || docs.length!==1){
                        console.error(err, number);
                        throw Error("ERROR_FETCH_TX");
                    }
                    else
                        resolve(docs[0]);
                });
            });
    });
}
