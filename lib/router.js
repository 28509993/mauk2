/**
 * Created by wangmin on 2018/7/5.
 */
class Router {
  constructor(doFn,controller,acl,ctx,next) {
    this.controller = controller;
    this.ctx = ctx;
    this.next = next;
    this.acl = acl;
    this.result = {}
    this.doFn = doFn
  }
  get query(){
    if (this.ctx.method === 'GET'){
      return this.ctx.request.query || {}
    } else if (this.ctx.method === 'POST')  {
      return this.ctx.request.body || {}
    } else {
      return {}
    }
  }
  get isMobile (){
    return this.ctx.header['user-agent'].toLowerCase().match(/(iphone|ipod|ipad|android)/);
  }
  async preRun(){
    //授权处理，返回true表示已处理，后续不用处理
    //比如一些跳转操作
    return false
  }
  async run (){
    if (await this.preRun()){

    } else {
      //可能会跳转
      try{
          await this.doFn.call(this,this)
        try{
          await this.success()
        }catch (err){
          console.error(err);
          await this.fail(e)
        }
      } catch (e){
       try{
         await this.fail(e)
       }catch (err){
         console.error(err);
       }
      }
    }
  }
  async fail (e){
    const val = {errcode: 9999, message: e.message, errstack:e.stack};
    Router.endBody(this.ctx,val)
  }
  async success (){
    const val = Object.assign({errcode: 0}, this.result);
    Router.endBody(this.ctx,val)
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

exports=module.exports=Router