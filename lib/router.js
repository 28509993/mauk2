/**
 * Created by wangmin on 2018/7/5.
 */
class Router {
  constructor(controller,acl,ctx,next) {
    this.controller = controller;
    this.ctx = ctx;
    this.next = next;
    this.acl = acl;
    this.result = null
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
  async started(){
    //授权处理，返回true表示已处理，后续不用处理
    return true
  }
  async run (){
    if (await this.isAuthorized()){

    } else {
      //可能会跳转
    }

  }
  async fail (){
    if (this.ctx.accepts('html')){
      this.ctx.response.type = 'text/html';
      this.ctx.response.body = "<h1>run fail!</h1>";
    } else if (this.ctx.accepts('json')) {
      this.ctx.response.body = {errcode:9999,message:'run ok'};
    }
  }
  async success (){
    if (this.ctx.accepts('html')){
      this.ctx.response.type = 'text/html';
      this.ctx.response.body = "<h1>run success!</h1>";
    } else if (this.ctx.accepts('json')) {
      this.ctx.response.body = {errcode:0,message:'run ok'};
    }
  }
}

exports=module.exports=Router