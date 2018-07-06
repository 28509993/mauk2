/**
 * Created by wangmin on 2018/7/6.
 */
const mauk = require('../../index')
class ExtendRouter extends mauk.Router {
  constructor(...args) {
    super(...args);
  }
  async fail (e){
    const val = {errcode: 9999, message: e.message, errstack:e.stack};
    ExtendRouter.endBody(this.ctx,val)
  }
  async success (){
    const val = Object.assign({errcode: 0}, this.result);
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

exports=module.exports=ExtendRouter