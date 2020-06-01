//项目节点共享collection
var mongoose = require('mongoose')

var reasons_model = {
    modify_time:{type: Date, default: Date.now()},
    belong_id:{type: String, required: true},
    name:{type: String, default: ''},
    start_time:{type: Date, default: null},
    end_time:{type: Date, default: null},
    status: {type: Number, required: true},
    detail:{type: String, default: ''},
    reason:{type: String, default: '初始创建'}
}
var reasonsSchema = new mongoose.Schema(reasons_model)
exports.reasons = mongoose.model('reasons', reasonsSchema)