//节点collection
var mongoose = require('mongoose')

// 创建节点文档数据模型
var node_model = {
    pro_id: {type: String, required: true},
    task_id: {type: String, required: true},
    name: {type: String, required: true},
    detail: {type: String, required: true},
    start_time: {type: Date, required: true},
    end_time: {type: Date, required: true},
    status: {type: Number, required: true},
    create_time: {type: Date, default: new Date()},
    finish_time: Date,
    body: [{
        time: {type: Date, default: new Date()},
        body: {type: String, required: true},
        file: [{
            name: String,
            url: String
        }]

    }],
    first_node:[],
    last_node:[]
}

var nodeSchema = new mongoose.Schema(node_model)
exports.self = mongoose.model('node', nodeSchema)