var mongoose = require('mongoose')

//创建项目文档模型
var pro_model = {
    name: {type: String, required: true},
    detail: {type: String, required: true},
    start_time: {type: Date, required: true},
    end_time: {type: Date, required: true},
    status: {type: Number, required: true},
    create_time: {type: Date, default: Date.now()},
    finish_time:{type: Date},
}
var proSchema = new mongoose.Schema(pro_model)
exports.self = mongoose.model('pro', proSchema)

//创建项目下的任务模型
var task_model = {
    name: {type: String, required: true},
    detail:{type: String, required: true},
    belong_id:{type: String, required: true},
    start_time:{type:Date, default:null},
    end_time: {type:Date, default:null}
}
var taskSchema = new mongoose.Schema(task_model)
exports.task = mongoose.model('task', taskSchema)





