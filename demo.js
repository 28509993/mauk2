const http = require('http');
const Koa = require('koa')
const app = new Koa()
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const mauk = require('./index')
const path = require('path')
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

class ExtendRouter extends mauk.Router {
  constructor(...args) {
    super(...args);
  }
  async fail (e){
    const val = {errcode: 9999, message: e.message, errstack:e.stack};
    // if (this.ctx.accepts('html')){
    //   this.ctx.response.type = 'text/html';
    //   this.ctx.response.body = `<h1>${JSON.stringify(val)}</h1>`;
    // } else if (this.ctx.accepts('json')) {
    //   this.ctx.response.body = val;
    // }
    ExtendRouter.endBody(this.ctx,val)
  }
  async success (){
    const val = Object.assign({errcode: 0}, this.result);
    // if (this.ctx.accepts('html')){
    //   this.ctx.response.type = 'text/html';
    //   this.ctx.response.body = `<h1>${JSON.stringify(val)}</h1>`;
    // } else if (this.ctx.accepts('json')) {
    //   this.ctx.response.body = val
    // }
    ExtendRouter.endBody(this.ctx,val)
  }
  static endBody(ctx, val){
    if (ctx.accepts('html')){
      ctx.response.type = 'text/html';
      ctx.response.body = `<h1>${JSON.stringify(val)}</h1>`;
    } else if (ctx.accepts('json')) {
      ctx.response.body = val
    }
  }
}

let handler = mauk({contextPath:'app/main',domain:'zzz'})
  .addPlus('demo/plusbase')
  .addPlus('demo/plusbusi')
  .build()
app.use(async(ctx,next) => {
  await  handler(ctx,next)
})

// app.use(async (ctx, next) => {
//   if (ctx.accepts('html')){
//     ctx.response.type = 'text/html';
//     ctx.response.body = "<h1>not haha found!</h1>";
//   } else if (ctx.accepts('json')) {
//     ctx.response.body = {errcode:9999,message:'not found'};
//   }
//   await next();
// })

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
const port = 3001
function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening (){
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

var server = http.createServer(app.callback());
server.listen(3001);
server.on('error', onError);
server.on('listening', onListening);


