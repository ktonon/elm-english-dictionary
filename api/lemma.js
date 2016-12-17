'use strict';

const logger = require('./logger');
const safe = require('./safe');
const router = require('koa-router');
const words = require('./words');

const api = module.exports = router({ prefix: '/lemma' });

api.get('/check/:lemma', function* () {
  const lemma = this.params.lemma;
  logger.info(`check: ${lemma}`);
  this.body = !!words.ids[safe(lemma)];
});

api.get('/define/:lemma', function* () {
  const lemma = this.params.lemma;
  logger.info(`define: ${lemma}`);
  const ids = words.ids[safe(lemma)];
  if (ids) {
    this.body = ids.map(meaning =>
      meaning.map(id =>
        words.defs[id]));
  } else {
    this.throw(404);
  }
});
