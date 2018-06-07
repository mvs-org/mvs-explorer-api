'use strict';

//Load Models
var Mits = require('../models/mits.js'),
    Message = require('../models/message.js');

exports.ListAllMits = listmits;
exports.MitsInfo = mitsinfo;
exports.Search = search;

/**
 * Get the list of all the mits.
 * @param {} req
 * @param {} res
 */
function listmits(req, res) {
    var show_invalidated = req.query.show_invalidated > 0;
    var page = parseInt(req.query.page) || 0;
    var items_per_page = (req.query.items_per_page) ? parseInt(req.query.items_per_page) : 50;
    Mits.listmits(show_invalidated, page, items_per_page)
        .then((mits) => res.json(Message(1, undefined, mits)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_MITS')));
};

/**
 * Get a specific mit.
 * @param {} req
 * @param {} res
 */
function mitsinfo(req, res) {
    var symbol = req.params.symbol;
    var show_invalidated = req.query.show_invalidated>0;
    Mits.mitsinfo(symbol, show_invalidated)
        .then((mits) => res.json(Message(1, undefined, mits)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_MITS_INFO')));
};

/**
 * Search for a excat match of MIT symbol.
 * @param {} req
 * @param {} res
 */
function search(req, res) {
    let symbol = req.params.symbol;
    Mits.suggest(symbol)
        .then((mit) => res.json(Message(1, undefined, mit)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_SEARCH_MIT')));
};
