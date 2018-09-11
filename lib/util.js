/**
 * Created by wangmin on 2018/7/7.
 */
const path = require('path')
const fs = require('fs')
function walkDir(dir,rule) {
  var fileList = [];
  function walk(targetPath, deepth) {
    if (deepth <= 0) return;
    var dirList = fs.readdirSync(targetPath);
    dirList.forEach(function (item) {
      let fullpath = path.join(targetPath, item);
      if (fs.statSync(fullpath).isFile()) {
        rule.test(item) && fileList.push(fullpath)
      } else if (fs.statSync(fullpath).isDirectory()) {
        walk(fullpath, deepth - 1);
      }
    });
  }
  walk(dir, 4);
  return fileList;
}
function isFunction(fn) {
  return typeof (fn) === 'function'
}
exports=module.exports= {walkDir,isFunction}