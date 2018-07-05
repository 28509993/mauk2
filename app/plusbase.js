/**
 * Created by wangmin on 2017/7/14.
 */

exports = module.exports = tuple(function base() {
		return function (sn) {
      console.log('log base = ' + sn)
			return function(){
        console.log('log base ok '+ sn)
			}

		}
	});
