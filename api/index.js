'use strict';

const bodyParser = require('koa-bodyparser');
const koa = require('koa');
const cors = require('koa-cors');
const logger = require('./logger');
const logging = require('@microservice/koa-logging');
const middleware = require('./middleware');
const router = require('koa-router');
const serverless = require('serverless-http');
const dict = require('./dict');

const routes = router();
routes.use(middleware.error);
routes.use(logging(logger));
routes.use(bodyParser());

routes.use(dict.routes());
routes.use(dict.allowedMethods());

routes.get('/', function* () {
  this.body = 'English Dictionary';
});

module.exports.routes = routes;

const app = koa();
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'HEAD', 'OPTIONS'],
}));
app.use(routes.routes());
app.use(routes.allowedMethods());
module.exports.handler = serverless(app);
