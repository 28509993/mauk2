/**
 * Created by wangmin on 2018/7/5.
 */
const controller =  require('./controller');
class Router {
  constructor(options,acl,ctx,next) {
    this.options = options;
    this.ctx = ctx;
    this.next = next;
  }
  async run (){
    if (this.ctx.accepts('html')){
      this.ctx.response.type = 'text/html';
      this.ctx.response.body = "<h1>run ok!</h1>";
    } else if (this.ctx.accepts('json')) {
      this.ctx.response.body = {errcode:9999,message:'run ok'};
    }
  }
}

exports=module.exports=Router