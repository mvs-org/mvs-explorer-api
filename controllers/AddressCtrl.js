'use strict';

var Message = require('../models/message.js');
let Address = require('../models/address.js');
let Block = require('../models/block.js');

exports.ListTxs = ListTxs;
exports.listInOuts = listInOuts;
exports.Info = Info;

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

function Info(req, res) {
    var address = req.params.address;
    Promise.all([Address.listTxsData(address), Block.height()])
        .then((result) => Promise.all([evaluateTxs(address, result[0], result[1]), result[0]]))
        .then((results) => {
            res.json(Message(1, undefined, {
                assets: results[0],
                tx_count: results[1].length
            }));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_TRANSACTIONS'));
        });
}

function evaluateTxs(address, txs, current_height) {
    var assets = {
        'ETP': {
            received: 0,
            locked: 0,
            sent: 0,
            decimals: 8
        }
    };
    return Promise.all(txs.map((tx) => Promise.all([evaluateInputs(tx, address, assets, current_height), evaluateOutputs(tx, address, assets, current_height)])))
        .then(() => assets);
}

function evaluateInputs(tx, address, assets, current_height) {
    return Promise.all(tx.inputs.map((input) => {
        if (input.address === address) {
            if (assets[input.attachment.symbol] === undefined && input.attachment.symbol != "ETP") {
                //Initialize input stats
                assets[input.attachment.symbol] = {
                    received: 0,
                    sent: 0,
                    decimals: input.attachment.decimals
                };
                assets[input.attachment.symbol].sent += parseInt(input.attachment.quantity);
            }
            assets['ETP'].sent += parseInt(input.value);
        }
    }));
};

function evaluateOutputs(tx, address, assets, current_height) {
    return Promise.all(tx.outputs.map((output) => {
        if (output.address === address) {
            if (assets[output.attachment.symbol] === undefined && output.attachment.symbol != "ETP") {
                assets[output.attachment.symbol] = {
                    received: 0,
                    sent: 0,
                    decimals: output.attachment.decimals
                };
                assets[output.attachment.symbol].received += parseInt(output.attachment.quantity);
            }
            if (output.locked_height_range + tx.height > current_height)
                assets['ETP'].locked += output.value;
            assets['ETP'].received += output.value;
        }
    }));
};

function listInOuts(req, res) {
    let addresses = req.query.addresses || [];
    Address.listAddressIds(addresses)
        .then((address_ids) => Promise.all([Address.listInputs(address_ids), Address.listOutputs(address_ids)]))
        .then((inandouts) => {
            res.status(200).json(Message(1, undefined, inandouts));
        })
        .catch((error) => {
            console.error(error);
            res.status(404).json(Message(0, 'ERR_LIST_IO'));
        });
}
