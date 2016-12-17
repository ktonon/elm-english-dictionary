'use strict';

const conf = require('./conf');

module.exports = require('@microservice/logger')({
  name: 'english-dictionary',
  environment: conf.stage,
});
