/**
 * Created by wangmin on 2018/7/5.
 */

const path = require('path')
const controller =  require('./controller');
exports=module.exports=function({contextPath, domain}){
  const options = {contextPath: path.resolve(contextPath), domain}
  const ctl =  controller(options)
  const builder = {}
  function build (){
    ctl.compile()
    return async function handler(ctx,next){
      const router = ctl.createRouter(ctx,next)
      if (!router) {
        await next();
        return;
      }else {
        await router.run()
      }
    }
  }
  function addPlus(plusFile){
    ctl.addPlus(path.resolve(plusFile))
    return builder;
  }
  builder.build = build;
  builder.addPlus = addPlus;
  return builder
}

