'use strict';

//Load Models
var Message = require('../models/message.js');
var Transaction = require('../models/transaction');
var Block = require('../models/block');

exports.FetchTx = fetch;
exports.LockSum = locksum;
exports.Rewards = rewards;

function rewards (req, res) {
    Block.height()
        .then( (height) => Transaction.rewards(height) )
        .then( (rewards) => res.json(Message(1, undefined, rewards)))
        .catch( (error) => res.status(404).json(Message(0, 'ERR_FETCH_REWARDS')) );
};

function locksum (req, res) {
    Block.height()
        .then( (height) => Transaction.locksum(height) )
        .then( (sum) => res.json(Message(1, undefined, sum)))
        .catch( (error) => res.status(404).json(Message(0, 'ERR_FETCH_LOCKSUM')) );
};

/**
 * Get transaction for given hash.
 * @param {} req
 * @param {} res
 */
function fetch (req, res) {
    var hash = req.params.hash;
    Transaction.fetch(hash)
        .then( (tx) => Transaction.includeTransactionData(tx))
        .then( (tx) => res.json(Message(1, undefined, tx)))
        .catch( (error) => res.status(404).json(Message(0, 'ERR_FETCH_TX')) );
};
