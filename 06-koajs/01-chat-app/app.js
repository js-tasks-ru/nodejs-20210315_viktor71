const path = require('path');
const Koa = require('koa');
const app = new Koa();
const EventEmitter = require('events');

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();
const messageEmitter = new EventEmitter();

router.get('/subscribe', async (ctx) => {
  ctx.body = await new Promise((resolve) => {
    messageEmitter.once('message', (message) => {
      resolve(message);
    });
  });
});

router.post('/publish', async (ctx) => {
  const message = ctx.request.body.message;
  if (message) {
    messageEmitter.emit('message', ctx.request.body.message);
  }
  ctx.body = '';
});

app.use(router.routes());

module.exports = app;
