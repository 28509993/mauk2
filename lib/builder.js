/**
 * Created by wangmin on 2018/7/5.
 */

const path = require('path')
const controller =  require('./controller');
exports=module.exports=function({contextPath, domain, setting}){
  const options = {contextPath: path.resolve(contextPath), domain, setting}
  const ctl =  controller(options)
  function build (){
    ctl.compile()
    return async function handler(ctx,next){
      const router = ctl.buildRouter(ctx,next)
      if (!router) {
        await next();
      }else {
        await router.run()
      }
    }
  }
  function addPlus(plusFile,referenceFile){
    if (referenceFile){
      ctl.addPlus(path.resolve(referenceFile,plusFile))
    } else {
      ctl.addPlus(path.resolve(plusFile))
    }
    return this;
  }
  function addBean(beanClass){
    ctl.addBean(beanClass)
    return this;
  }
  return {build,addPlus,addBean}
}
