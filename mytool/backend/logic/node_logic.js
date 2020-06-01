var node = require('../db/db_node.js')
var pub = require('../db/db_public.js')
var pro = require('../db/db_pro')

exports.create = function(req, res){
    var nodePar = req.body.nodePar, taskPar = req.body.taskPar, taskQuery = req.body.taskQuery
    if (nodePar) {
        nodePar = JSON.parse(nodePar)
        taskPar = JSON.parse(taskPar)
        taskQuery = JSON.parse(taskQuery)
            //创建节点
        node.self.create(nodePar)
            //创建历史纪录
            .then(doc => {
                nodePar.belong_id = doc._id
                return pub.reasons.create(nodePar)
                    .then (reason => ({doc, reason}))
            })
            //更新任务时间
            .then( ({doc}) => {
                if(taskPar.toString() == '{}') return Promise.resolve(doc)
                return pro.task.update(taskQuery, taskPar)
                    .then( result => Promise.resolve(doc))
                    .catch( err => Promise.reject(err))
            })
            //更新前置节点
            .then( doc => {
                if(nodePar.first_node && nodePar.first_node.length){
                    var promiseList = [], par = {$push: {last_node: doc._id}}
                    nodePar.first_node.forEach( _id => {
                        promiseList.push(node.self.update({_id}, par))
                    })
                    return Promise.all(promiseList)
                        .then( result => Promise.resolve({doc, result}))
                        .catch( err => Promise.reject(err))
                } else {
                   return Promise.resolve(doc)
                }
            })
            .then(doc => res.send(doc))
            .catch( err => {
                res.status(400).send(err)
            })
    } else {
        res.status(400).send({error: true, message: '缺少参数: nodePar or taskPar or taskQuery'})
    }
}

exports.find = function(req, res){
    var que = req.body.que
    if(que){
        que = JSON.parse(que)
        node.self.find(que)
            .then( docs => res.send(docs))
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: que'})
    }
}

exports.setBody = function(req, res){
    var par = req.body.par, que = req.body.que
    if(par && que){
        par = JSON.parse(par)
        que = JSON.parse(que)
        node.self.findOneAndUpdate(que, par, {new: true})
            .then( doc => res.send(doc))
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: par or que'})
    }
}

exports.nodeDelete = function(req, res){
    var que = req.body.que
    if(que){
        que = JSON.parse(que)
        node.self.findOneAndDelete(que)
            //删除本节点
            .then( doc => doc)
            //删除节点修改记录
            .then( doc => {
                var que = {belong_id: doc._id}
                return pub.reasons.deleteMany(que)
                    .then( result => ({doc, result}))
                    .catch( err => err)
            })
            //查找同任务下所有节点
            .then( ({doc}) => {
                return node.self.find({task_id: doc.task_id})
                    .then( docs => ({docs, doc}))
                    .catch( err => err)
            })
            //更新所属任务时间
            .then( ({docs, doc}) => {
                var que = {_id: doc.task_id}, par = {start_time: null, end_time: null}
                if(docs.length) {
                    docs.sort((a, b) => {
                        return a.end_time - b.end_time
                    })
                    par.start_time = docs[0].start_time
                    par.end_time = docs[docs.length - 1].end_time
                }
                return pro.task.findByIdAndUpdate(que, {$set:par}, {new: true})
                    .then(task => ({doc, task}))
                    .catch(err => err)
            })
            //更新前置节点
            .then( ({doc}) => {
                var promiseList = [], nodes = doc.first_node
                if(nodes && nodes.length){
                    nodes.forEach( i => {
                        var promise = node.self.updateOne({_id: i}, {$pull:{last_node: doc._id}})
                        promiseList.push(promise)
                    })
                    return Promise.all(promiseList)
                        .then( result => ({result, doc}))
                        .catch( err => err)
                } else {
                    return {doc}
                }

            })
            .then( ({doc}) => {
                res.send(doc)
            })
            .catch( err => {
                res.status(400).send(err)
            })
    }else {
        res.status(400).send({error: true, message: '缺少参数: que'})
    }
}

exports.updateStatus = function(req, res){
    var que = req.body.que,  par = req.body.par
    if(que && par){
        que = JSON.parse(que)
        par = JSON.parse(par)
        node.self.findByIdAndUpdate(que, par, {new: true})
            .then( doc => {
                res.send(doc)
            })
            .catch( err => {
                res.status(400).send(err)
            })
    } else {
        res.status(400).send({error: true, message: '缺少参数: que or par'})
    }
}

exports.verifyName = function(req, res){
    var que = req.body.que
    if(que){
        que = JSON.parse(que)
        node.self.findOne(que)
            .then(doc => res.send(doc))
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: que'})
    }
}

exports.update = function(req, res){
    var que = req.body.que, par = req.body.par, par2 = req.body.par2
    if(que && par && par2){
        que = JSON.parse(que)
        par = JSON.parse(par)
        par2 = JSON.parse(par2)
        pub.reasons.create(par2)
            //创建修改记录
            .then( reason => Promise.resolve(reason))
            //修改节点
            .then( reason => {
                return node.self.findOneAndUpdate(que, par, {new: true})
                    .then( doc => Promise.resolve({doc,reason}))
                    .catch( err => Promise.reject(err))
            })
            //查询同任务下所有节点
            .then(({doc}) => {
                var que = {task_id: doc.task_id}
                return node.self.find(que)
                    .then( docs => Promise.resolve({docs, doc}))
                    .catch( err => Promise.reject(err))
            })
            //更新任务信息
            .then(({docs, doc})=> {
                docs.sort((a,b) => {
                    return a.end_time - b.end_time
                })
                var que = {_id: doc.task_id}
                var par = {$set:{start_time: docs[0].start_time, end_time: docs[docs.length - 1].end_time}}
                return pro.task.update(que, par, {new: true})
                    .then( task => Promise.resolve({doc, task}))
                    .catch( err => Promise.reject(err))
            })
            //返回修改后的node
            .then(({doc}) => {
                res.send(doc)
            })
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: que or par or par2'})
    }
}
//获取修改记录
exports.getUpdateRecord = function (req, res){
    var que = req.body.que
    if(que){
        que = JSON.parse(que)
        pub.reasons.find(que)
            .then( docs => res.send(docs))
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: que'})
    }
}