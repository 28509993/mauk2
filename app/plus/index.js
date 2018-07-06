/**
 * Created by wangmin on 2018/7/6.
 */
const path = require('path')
const ExtendRouter = require('../lib/ExtendRouter')

exports = module.exports = function (builder) {
  builder.addBean(ExtendRouter)
    .addPlus("../lib/index.js",__dirname)
    .addPlus("../plus/plusbase.js",__dirname)
    .addPlus("../plus/plusbusi.js",__dirname)
  return builder;
}
