var mongoose = require('mongoose')

//创建商户电话数据模型
var phone_module = {
    floor:{type: String, required: true},
    shopName:{type: String, required: true},
    mac:{type: String, required: true},
    phone:{type: String, required: true}
}
//节点collection
var phoneSchema = new mongoose.Schema(phone_module)
module.exports = mongoose.model('phone', phoneSchema)


