'use strict';

//Load Models
var Message = require('../models/message.js');
var Transaction = require('../models/transaction');
var Block = require('../models/block');
var Address = require('../models/address');
var Asset = require('../models/assets');
var Helper = require('../libraries/helper.js');

exports.Suggest = suggest;

/**
 * Suggest transactions, addresses, blocks and assets for given prefix.
 * @param {} req
 * @param {} res
 */
function suggest(req, res) {
    var prefix = req.params.prefix;
    var limit = parseInt(req.query.limit) || 10;

    Promise.all([
        Helper.checkError(limit <= 20, 'ERR_LIMIT_RANGE'),
        Helper.checkError(prefix.length>=3, 'ERR_PREFIX_LENGTH')
    ])
        .then(() => Promise.all([
            Transaction.suggest(prefix, limit),
            Address.suggest(prefix, limit, true),
            Block.suggest(prefix, limit),
            Asset.suggest(prefix, limit)
        ]))
        .then((suggestions) => {
            res.json(Message(1, undefined, {
                tx: suggestions[0],
                address: suggestions[1],
                block: suggestions[2],
                asset: suggestions[3]
            }));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, error.message));
        });
}
