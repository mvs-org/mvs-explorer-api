'use strict';

//Load Models
var Avatars = require('../models/avatars.js'),
    Message = require('../models/message.js');

exports.ListAllAvatars = listavatars;
exports.Search = search;
exports.AvatarInfo = avatarinfo;

/**
 * Get the list of all the avatars.
 * @param {} req
 * @param {} res
 */
function listavatars(req, res) {
    var page = parseInt(req.query.page) || 0;
    var items_per_page = (req.query.items_per_page) ? parseInt(req.query.items_per_page) : 100;
    Avatars.listavatars(page, items_per_page)
        .then((avatars) => res.json(Message(1, undefined, avatars)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_LIST_AVATARS'))
        });
};

/**
 * Search for avatars names.
 * @param {} req
 * @param {} res
 */
function search(req, res) {
    let prefix = req.params.prefix;
    var limit = parseInt(req.query.limit) || 10;
    Avatars.suggest(prefix, limit)
        .then((avatars) => res.json(Message(1, undefined, avatars)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_SEARCH_AVATARS'))
        });
};

/**
 * Get the information of an avatar.
 * @param {} req
 * @param {} res
 */
function avatarinfo(req, res) {
    var symbol = req.params.avatar_symbol;
    let search = (isAddress(symbol)) ? Avatars.avatarInfoByAddress : Avatars.avatarinfo
    search(symbol)
        .then((avatars) => res.json(Message(1, undefined, avatars)))
        .catch((error) => {
            console.error(error)
            res.status(404).json(Message(0, 'ERR_GET_AVATAR'))
        });
};

function isAddress(address) {
    return (address.length == 34) && (address.charAt(0) == 'M' || address.charAt(0) == 't' || address.charAt(0) == '3');
};
