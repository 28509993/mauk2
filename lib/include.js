/**
 * Created by wangmin on 2018/7/5.
 */
const path = require('path')
exports=module.exports=function(fullFile,referenceFile){
  if (referenceFile){
    fullFile = path.resolve(referenceFile, fullFile);
  }
  var defines=  require(fullFile)
  var pn=defines.length;
  if (pn<=0 || typeof (defines[pn-1] )!=='function') {
    throw new Error(fullFile)
  }
  var fn = defines[pn-1];
  var vars = []
  if (pn>1){
    vars=fn.toString().match(/\(([^|()]*)\)/);
    vars = !vars?[]:vars[1].replace(/\s/,'').split(',');
  }
  // if (fn.name === 'lib'){
  //   debugger
  // }
  return function(callback){
    var args=[];
    var argsMap={}
    var varName,varFn,varValue
    for (let i= 0,n=pn- 2;i<=n;i++){
      varName=defines[i];
      varFn=  (/^([^!]+)(!([\s\S]*))$/i).exec(varName);
      varValue=this.pluses[varName];
      if (varFn){
        let func=this.pluses[varFn[1]];
        varValue= typeof func ==='function'? func(varFn[3]):func;
      }
      args.push(varValue);
      vars[i] && (argsMap[vars[i]]=varValue);
    }
    let plus = fn.bind(this)(...args);
    // if (Object.prototype.toString.call(plus)==='[object Function]'){
    //
    //
    // }else if (Object.prototype.toString.call(plus)==='[object Array]'){
    //
    // }
    callback && callback({fn,plus});
    return plus;
  };
}