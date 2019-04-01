'use strict';

//Load Models
var Message = require('../models/message.js');
var Transaction = require('../models/transaction');
var Block = require('../models/block');

exports.FetchTx = fetch;
exports.LockSum = locksum;
exports.Rewards = rewards;
exports.List = List;
exports.Suggest = suggest;
exports.Broadcast = broadcast;
exports.FetchTxOutputs = outputs;

function List(req,res){
    var page = parseInt(req.query.page) || 0;
    var filter = {
        max_time: parseInt(req.query.max_time) || undefined,
        min_time: parseInt(req.query.min_time) || undefined,
        max_height: parseInt(req.query.max_height) || undefined,
        min_height: parseInt(req.query.min_height) || undefined
    };
    Transaction.list(page, 10, filter)
        .then((txs) => res.json(Message(1, undefined, txs)))
        .catch((error) => {
            console.error(error);
            res.status(400).json(Message(0, 'ERR_SEARCH_TX'));
        });
}

/**
 * Suggest transaction hashes for given prefix.
 * @param {} req
 * @param {} res
 */
function suggest(req, res) {
    var prefix = req.params.prefix;
    var limit = parseInt(req.query.limit) || 10;
    Transaction.suggest(prefix, limit)
        .then((hashes) => {
            res.json(Message(1, undefined, hashes));
        })
        .catch((error) => {
            console.error(error);
            res.status(400).json(Message(0, 'ERR_SUGGEST_TRANSACTIONS'));
        });
}

function rewards(req, res) {
    Block.height()
        .then((height) => Transaction.rewards(height))
        .then((rewards) => res.json(Message(1, undefined, rewards)))
        .catch((error) => {
            console.error(error);
            res.status(400).json(Message(0, 'ERR_FETCH_REWARDS'));
        });
};

function locksum(req, res) {
    Block.height()
        .then((height) => Transaction.locksum(height))
        .then((sum) => res.json(Message(1, undefined, sum)))
        .catch((error) => {
            console.error(error);
            res.status(400).json(Message(0, 'ERR_FETCH_LOCKSUM'));
        });
};

/**
 * Get transaction for given hash.
 * @param {} req
 * @param {} res
 */
function fetch(req, res) {
    var hash = req.params.hash;
    Transaction.fetch(hash)
        .then((tx) => {
            res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60')
            res.json(Message(1, undefined, tx))
        })
        .catch((error) => {
            console.error(error);
            res.status(400).json(Message(0, 'ERR_FETCH_TX'));
        });
};

/**
 * Broadcast given raw transaction.
 * @param {} req
 * @param {} res
 */
function broadcast(req, res) {
    var tx = req.body.tx;
    Transaction.broadcast(tx)
        .then((tx) => {
            if(tx.code==1021)
                tx.error="Error decoding transaction";
            res.json(Message(1, undefined, tx));
        })
        .catch((error) => {
            console.error(error);
            res.status(400).json(Message(0, 'ERR_BROADCAST_TX'));
        });
};

/**
 * Get transaction outputs for given hash.
 * @param {} req
 * @param {} res
 */
function outputs(req, res) {
    var hash = req.params.hash;
    Transaction.outputs(hash)
        .then((outputs) => res.json(Message(1, undefined, outputs)))
        .catch((error) => {
            console.error(error);
            res.status(400).json(Message(0, 'ERR_FETCH_TX_OUTPUTS'));
        });
};
