/**
 * Created by wangmin on 18/7/16.
 */

exports = module.exports = tuple('log!access','lib','base!111','abusi', function hello(log,lib,base,abusi) {
  return [
    tuple('noname', function (r) {
      r.result = {a: 'noname'}
    }),
    tuple({rule:'kkkk',domain:'abc'}, function (r) {
      r.result = {a: 'noname'}
    })
  ];
});





