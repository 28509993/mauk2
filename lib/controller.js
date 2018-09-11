/**
 * Created by wangmin on 2018/7/5.
 */
const path = require('path')
const fs = require('fs')
const Router =  require('./router');
const util =  require('./util');
const log = require('./logger')

function createLeaf(acl, fn) {
  const self = this
  util.isFunction(acl) && (fn = acl, acl = fn.name);
  if (!util.isFunction(fn)) return;
  var opttype = Object.prototype.toString.call(acl);
  acl = opttype === "[object RegExp]" || opttype === "[object String]" ? {rule: acl} : acl
  acl.rule || (acl.rule = fn.name);
  var domain = acl.domain
  if (self.domain && domain) {
    if (self.domain !==domain){
      return
    }
  }
  fn.rule = acl.rule;
  fn.method = acl.method || '*';
  if (typeof (fn.rule) === 'string') {
    fn.rule = new RegExp('^' + fn.rule + '$', 'i');
  }
  if (acl.auth !== false){
    acl.auth = true
  }
  fn.auth = acl.auth
  fn.acl = acl
  if (!fn.rule) return;
  return fn;
};

function createLeaves(leaves) {
  const newLeaves = [];
  const self = this
  const createLeafBind = createLeaf.bind(self)
  leaves && leaves.forEach(function (fn) {
    let leaf = util.isFunction(fn) ? createLeafBind(fn) : createLeafBind(...fn);
    leaf && newLeaves.push(leaf);
  });
  return newLeaves;
}

function  addTreeRouters() {
  const self = this
  const start = self.root;
  const createLeavesBind = createLeaves.bind(self)
  util.walkDir(self.contextPath,/^\$/).forEach(function (item) {
    try {
      const branchs = path.relative(self.contextPath, item).split(path.sep).slice(0, -1);
      var parent = start;
      branchs.forEach(function (branch) {
        branch = branch.toLowerCase();
        parent = parent[branch] || (parent[branch] = emptyNode());
      });
      parent['$$'] = parent['$$'].concat(createLeavesBind(include(item).bind(self)()));
    } catch (e) {
      console.error(e);
    }
  });
}

function emptyNode() {
  return {'$$': []};
}

function createRouter (ctx,next){
  const self = this
  let url = ctx.path.toLowerCase();
  let doFn = self.cache[url];
  if (!doFn) {
    let branchs = url.replace(/^\//, '').split('/');
    branchs[0] || (branchs[0] = '/')
    let start = self.root;
    let i = 0;
    for (let n = branchs.length; i < n; i++) {
      const branch = start[branchs[i]];
      if (!branch) break;
      start = branch;
    }
    const leaf = branchs.slice(i).join('/');
    let fns = start['$$'] || [];
    i = 0;
    for (let n = fns.length; i < n; i++) {
      let fn = fns[i];
      if (fn.rule && fn.rule.test(leaf)) {
        doFn = fn;
        self.cache[url] = fn;
        break;
      }
    }
  }

  if (doFn && (doFn.method === '*' || doFn.method === ctx.method)) {
    return new this.RouterClass(doFn,this,doFn.acl,ctx,next)
  }

}

function replaceRouter() {
  this.beans.forEach((item) => {
    if (item.__proto__ === Router){
      this.RouterClass = item
    }
  })
}

function createUsingPlus(){
  const self = this
  const usingPlus = function usingPlus(fullFile,referenceFile){
    if (referenceFile){
      fullFile = path.resolve(referenceFile, fullFile);
    }
    const fns = include(fullFile).bind(self)()
    const fnMap = {}
    if (!Array.isArray(fns)) return fnMap
    fns.forEach(function (item){
      if (item.name){
        fnMap[item.name] = item;
      }
    })
    return fnMap;
  }
  self.pluses['using'] = usingPlus
  usingPlus.init =function (referenceFile){
    let plusSet = {};
    plusSet.add = function  add(filePath) {
      Object.assign(plusSet,usingPlus(filePath, referenceFile))
      return plusSet;
    }
    return plusSet;
  }
}



class Controller {
  constructor(options) {
    this.options = options
    this.contextPath = options.contextPath
    this.domain = options.domain
    this.root = emptyNode();
    this.cache = {};
    this.pluses = {log: log}
    this.createRouter = createRouter.bind(this);
    this.beans = []
    this.RouterClass = Router
    createUsingPlus.bind(this)()
  }
  buildRouter (ctx,next){
    const router = this.createRouter(ctx,next)
    return router
  }
  addBean (beanClass){
    this.beans.push(beanClass)
  }
  addPlus (plusFile){
    if (!plusFile) return
    const self = this
    include(plusFile).bind(this)(({fn,plus}) => {
      self.pluses[fn.name] = plus
    })
  }
  getPlus (name,para){
    let varFn=this.pluses[name];
    if (para!==undefined){
      varFn = varFn(para)
    }
    return varFn
  }
  compile (){
    replaceRouter.bind(this)()
    addTreeRouters.bind(this)()
  }
}

exports=module.exports=function(options){
  return new Controller(options)
}

