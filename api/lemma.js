'use strict';

const logger = require('./logger');
const router = require('koa-router');

const api = module.exports = router({ prefix: '/lemma' });

api.get('/', function* () {
  logger.info('GET /lemma');
  this.body = 'ok';
});
