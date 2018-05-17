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
    Avatars.listavatars()
        .then((avatars) => res.json(Message(1, undefined, avatars)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_AVATARS')));
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
        .catch((error) => res.status(404).json(Message(0, 'ERR_SEARCH_AVATARS')));
};

/**
 * Get the information of an avatar.
 * @param {} req
 * @param {} res
 */
function avatarinfo(req, res) {
    var symbol = req.params.avatar_symbol;
    Avatars.avatarinfo(symbol)
        .then((avatars) => res.json(Message(1, undefined, avatars)))
        .catch((error) => res.status(404).json(Message(0, 'ERR_LIST_AVATARS')));
};
