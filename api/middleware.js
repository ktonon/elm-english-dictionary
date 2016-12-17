'use strict';

const m = module.exports = {};

m.error = function* (next) {
  try {
    yield next;
  } catch (err) {
    this.status = err.status || err.statusCode || 500;
    this.body = err.cause || (err.message ? { message: err.message } : err);
    this.app.emit('error', err, this);
  }
};
