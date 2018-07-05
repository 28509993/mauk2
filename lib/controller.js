/**
 * Created by wangmin on 2018/7/5.
 */
const path = require('path')
const fs = require('fs')
const Router =  require('./router');

function findRouteFiles(dir) {
  var fileList = [];
  function walk(targetPath, deepth) {
    if (deepth <= 0) return;
    var dirList = fs.readdirSync(targetPath);
    dirList.forEach(function (item) {
      let fullpath = path.join(targetPath, item);
      if (fs.statSync(fullpath).isFile()) {
        (/^\$/).test(item) && fileList.push(fullpath)
      }
    });
    dirList.forEach(function (item) {
      let fullpath = path.join(targetPath, item);
      if (fs.statSync(fullpath).isDirectory()) {
        walk(fullpath, deepth - 1);
      }
    })
  }
  walk(dir, 4);
  return fileList;
}

function isFunction(fn) {
  return typeof (fn) === 'function'
}

function createLeaf(acl, fn) {
  const self = this
  isFunction(acl) && (fn = acl, acl = fn.name);
  if (!isFunction(fn)) return;
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
  acl.noAuth && (fn.noAuth = acl.noAuth);
  fn.acl = acl
  if (!fn.rule) return;
  return fn;
};

function createLeaves(leaves) {
  const newLeaves = [];
  const self = this
  const createLeafBind = createLeaf.bind(self)
  leaves && leaves.forEach(function (fn) {
    let leaf = isFunction(fn) ? createLeafBind(fn) : createLeafBind(...fn);
    leaf && newLeaves.push(leaf);
  });
  return newLeaves;
}

function  addTreeRouters() {
  const self = this
  const start = self.root;
  const createLeavesBind = createLeaves.bind(self)
  findRouteFiles(self.contextPath).forEach(function (item) {
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

function routeaaa () {
  var self = this;
  return function (req, res, next) {
    var url = req._parsedUrl.pathname.toLowerCase();
    var doFn = self.cache[url];
    if (!doFn) {
      var branchs = url.replace(/^\//, '').split('/');
      branchs[0] || (branchs[0] = '/')
      var start = self.root;
      var i = 0;
      for (var n = branchs.length; i < n; i++) {
        var branch = start[branchs[i]];
        if (!branch) break;
        start = branch;
      }
      var leaf = branchs.slice(i).join('/');
      //console.log(leaf);
      var fns = start['$$'] || [];
      i = 0;
      for (var n = fns.length; i < n; i++) {
        var fn = fns[i];
        if (fn.rule && fn.rule.test(leaf)) {
          doFn = fn;
          self.cache[url] = fn;
          break;
        }
      }
    }

    if (doFn && !doFn.noAuth && !req.isAuthorized()) {
      var err = new Error('This user is not authorized!!----' + __filename)
      err.status = 500;
      next(err);
    } else {
      if (doFn && (doFn.method === '*' || doFn.method === req.method)) {
        req.waitPost && (!doFn.waitPost) && req.waitPost.call(req, function (err) {
          if (err)  return next(err);
          doFn.view && (res.$view = doFn.view);
          req.$options = doFn.options
          doFn.call(Object.assign ({app: app, req: req, res: res, next: next}, doFn.modules), req, res, next);
        });
      } else {
        next();
      }
    }
  }
}

function createRouter (ctx,next){
  const self = this
  console.log(ctx.request.body)
  var url = ctx.path.toLowerCase();
  var doFn = self.cache[url];
  if (!doFn) {
    var branchs = url.replace(/^\//, '').split('/');
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
    for (var n = fns.length; i < n; i++) {
      let fn = fns[i];
      if (fn.rule && fn.rule.test(leaf)) {
        doFn = fn;
        self.cache[url] = fn;
        break;
      }
    }
  }

  if (doFn && !doFn.noAuth && !req.isAuthorized()) {
    var err = new Error('This user is not authorized!!----' + __filename)
    err.status = 500;
    next(err);
  } else {
    if (doFn && (doFn.method === '*' || doFn.method === ctx.method)) {
      req.waitPost && (!doFn.waitPost) && req.waitPost.call(req, function (err) {
        if (err)  return next(err);
        doFn.view && (res.$view = doFn.view);
        req.$options = doFn.options
        doFn.call(Object.assign ({app: app, req: req, res: res, next: next}, doFn.modules), req, res, next);
      });
    } else {
      next();
    }
  }
}

class Controller {
  constructor(options) {
    this.options = options
    this.contextPath = options.contextPath
    this.domain = options.domain
    this.root = emptyNode();
    this.cache = {};
    this.pluses = {}
  }
  createRouter (ctx,next){
    return createRouter.bind(this)(ctx,next)
    // const router = new Router(this.options,{acl:1},ctx,next)
    // return router;
  }
  addPlus (plusFile){
    if (!plusFile) return
    const self = this
    include(path.resolve(plusFile)).bind(this)(({fn,plus}) => {
      self.pluses[fn.name] = plus
    })
  }
  compile (){
    addTreeRouters.bind(this)()
  }
}

exports=module.exports=function(options){
  return new Controller(options)
}
