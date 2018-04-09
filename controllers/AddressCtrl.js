'use strict';

var Message = require('../models/message.js');
let Address = require('../models/address.js');
let Asset = require('../models/assets.js');
let Block = require('../models/block.js');

exports.ListTxs = ListTxs;
exports.Suggest = Suggest;
exports.ListBalances = ListBalances;

/**
 * List transactions for given address.
 * @param {} req
 * @param {} res
 */
function ListTxs(req, res) {
    var address = req.params.address;
    var page = parseInt(req.query.page) | 0;
    var from = parseInt(req.query.from);
    var to = parseInt(req.query.to);
    var items_per_page = (req.query.items_per_page) ? parseInt(req.query.items_per_page) : 10;
    Address.listTxsDataCounted(address, page, items_per_page, from, to)
        .then((txs_data) => {
            res.json(Message(1, undefined, {
                transactions: txs_data.result,
                count: txs_data.count,
                items_per_page: items_per_page
            }));
        })
        .catch((error) => {
            console.error('Error listing txs for address : ' + error.message);
            res.status(404).json(Message(0, 'ERR_LIST_TRANSACTIONS'));
        });
}

function Suggest(req, res) {
    let prefix = req.params.prefix;
    let limit = 10;
    let includeTxCount=false;
    Address.suggest(prefix, limit, includeTxCount)
        .then((addresses) => res.status(200).json(Message(1, undefined, addresses)))
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_SUGGEST_ADDRESSES'));
        });
};

function ListBalances(req, res) {
    let address = req.params.address;
    Block.height()
        .then((height) => Address.balances(address, height))
        .then((balances) => {
            balances['definitions'] = {};
            Asset.listassets()
                .then((assets) => Promise.all(assets.map((asset) => {
                    if (typeof(balances['tokens'][asset.symbol]) != 'undefined') {
                        balances['definitions'][asset.symbol] = asset;
                    }
                })))
                .then(() => res.status(200).json(Message(1, undefined, balances)));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_BALANCES'));
        });
};
