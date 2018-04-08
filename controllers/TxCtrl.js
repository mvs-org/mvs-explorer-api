'use strict';

//Load Models
var Message = require('../models/message.js');
var Transaction = require('../models/transaction');
var Block = require('../models/block');

exports.FetchTx = fetch;
exports.LockSum = locksum;
exports.Rewards = rewards;
exports.Search = search;
exports.Suggest = suggest;

function search(req,res){
    var string = req.query.string;
    Transaction.search(string)
        .then((txs) => res.json(Message(1, undefined, txs)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_SEARCH_TX')));
}

/**
 * Suggest transaction hashes for given prefix.
 * @param {} req
 * @param {} res
 */
function suggest(req, res) {
    var prefix = req.params.prefix;
    var limit = parseInt(req.query.limit) | 10;
    Transaction.suggest(prefix, limit)
        .then((hashes) => {
            res.json(Message(1, undefined, hashes));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_SUGGEST_TRANSACTIONS'));
        });
}

function rewards(req, res) {
    Block.height()
        .then((height) => Transaction.rewards(height))
        .then((rewards) => res.json(Message(1, undefined, rewards)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_FETCH_REWARDS')));
};

function locksum(req, res) {
    Block.height()
        .then((height) => Transaction.locksum(height))
        .then((sum) => res.json(Message(1, undefined, sum)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_FETCH_LOCKSUM')));
};

/**
 * Get transaction for given hash.
 * @param {} req
 * @param {} res
 */
function fetch(req, res) {
    var hash = req.params.hash;
    Transaction.fetch(hash)
        .then((tx) => res.json(Message(1, undefined, tx)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_FETCH_TX')));
};
