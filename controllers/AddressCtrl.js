'use strict';

var Message = require('../models/message.js');
let Address = require('../models/address.js');
let Block = require('../models/block.js');

exports.ListTxs = ListTxs;
exports.ListBalances = ListBalances;

/**
 * List transactions for given address.
 * @param {} req
 * @param {} res
 */
function ListTxs(req, res) {
    var address = req.params.address;
    var page = parseInt(req.query.page) | 0;
    var items_per_page = (req.query.items_per_page) ? parseInt(req.query.items_per_page) : 10;
    Address.listTxsDataCounted(address, page, items_per_page)
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

function ListBalances(req,res) {
    let address = req.params.address;
    Block.height()
        .then((height)=>Address.balances(address, height))
        .then((balances) => {
            res.status(200).json(Message(1, undefined, balances));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_BALANCES'));
        });
};
