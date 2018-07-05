/**
 * Created by wangmin on 18/7/16.
 */


exports = module.exports = tuple('log!access','base!111','busi', function hello(log,base,busi) {
  console.log('base==',base())
  console.log('busi=',busi)
  return [
    tuple('noname', function (r) {
      r.result = {a: 'noname'}
    }),
    tuple({rule:'kkkk',domain:'abc'}, function (r) {
      r.result = {a: 'noname'}
    })
  ];
});





