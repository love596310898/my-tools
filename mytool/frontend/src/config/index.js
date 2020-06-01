import * as constants from './constants'
import * as functions from './functions'

const install = function (Vue) {
  // 注册全局常量
  for (let key in constants) {
    Vue[key] = constants[key]
    Vue.prototype['$' + key] = constants[key]
  }
  // 注册全局方法
  for (let key in functions) {
    Vue[key] = functions[key]
    Vue.prototype['$' + key] = functions[key]
  }
}

export default install
