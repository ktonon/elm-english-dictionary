const koa = require('koa');
const api = require('./api').routes;
const cors = require('koa-cors');

const port = 7631;

const app = koa();
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'HEAD', 'OPTIONS'],
}));
app.use(api.routes());
app.use(api.allowedMethods());

module.exports = app;

if (require.main === module) {
  app.listen(port, (err) => {
    if (err) { throw err; }
    // eslint-disable-next-line no-console
    console.log(`Started on http://localhost:${port}`);
  });
}
