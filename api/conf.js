'use strict';

const rc = require('rc');

const conf = rc('engdict', {
  stage: 'dev',
});

module.exports = conf;
