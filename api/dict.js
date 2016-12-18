'use strict';

const logger = require('./logger');
const safe = require('./safe');
const router = require('koa-router');
const words = require('./words');

const api = module.exports = router();

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
    this.body = ids.reduce(
      (acc, pos) => acc.concat(pos.map((id) => {
        const d = words.defs[id];
        return {
          partOfSpeech: d[0],
          meaning: d[1],
          examples: d[2] || [],
        };
      }))
    , []);
  } else {
    this.throw(404);
  }
});
