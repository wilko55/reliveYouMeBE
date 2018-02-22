'use strict';

let env = require('./config.json');

exports.config = function () {
    let nodeEnv = process.env.NODE_ENV || 'development';
    return env[nodeEnv];
};
