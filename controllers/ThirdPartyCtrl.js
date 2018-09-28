'use strict';

var config = require('../config/thirdparty.js'),
    Message = require('../models/message.js');

module.exports = {
    rates: rates,
};

function rates(req, res) {
    res.json(Message(1, undefined, config.conversion));
}
