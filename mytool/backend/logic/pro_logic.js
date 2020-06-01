var pro = require('../db/db_pro.js')
var pub = require('../db/db_public')

exports.create = function (req, res){
    var par = req.body.par
    if(par) {
        par = JSON.parse(par)
        pro.self.create(par)
            .then(doc => doc)
            .then( doc => {
                par.belong_id = doc._id
                return pub.reasons.create(par)
                    .then( reason => ({doc, reason}))
                    .catch( err => err)
            })
            .then( ({doc}) => res.send(doc))
            .catch(err => res.status(400).send(err))
    } else {
        res.status(400).send({ error: true, message: '缺少参数 par'})
    }
}

exports.find = function(req, res){
    var que = req.body.que
    if(que){
        que = JSON.parse(que)
        pro.self.find(que).then(function(docs){
            res.send(docs)
        }).catch(function(err){
            res.status(400)
            res.send(err)
        })
    }else {
        res.status(400).send({ error: true, message: '缺少参数: que'})
    }

}

exports.createTask = function(req, res){
    var par = req.body.par
    if (par) {
        par = JSON.parse(par)
        pro.task.create(par).then(doc => res.send(doc))
            .catch(err => res.status(400).send(err))
    } else {
        res.status(400).send({ error: true, message: '未找到参数 par'})
    }
}

exports.findTask = function(req, res){
    var id = req.body.id
    if(id){
        pro.task.find({belong_id: id}).then( docs => res.send(docs))
            .catch( err => res.send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: id'})
    }
}

exports.deleteTask = function (req, res) {
    var _id = req.body.id
    if(_id){
        pro.task.deleteOne({_id}).then( result => res.send(result))
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: id'})
    }
}

exports.modifyTask = function (req, res) {
    var _id = req.body.id , par = req.body.par
    if(_id && par){
        pro.task.updateOne({_id}, JSON.parse(par)).then( result => res.send(result))
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: id or par'})
    }
}

exports.modifyPro = function(req, res){
    var _id = req.body.id, par = req.body.par, par2 = req.body.par2
    if(_id && par && par2){
        par = JSON.parse(par)
        par2 = JSON.parse(par2)
        pro.self.findOneAndUpdate({_id}, par, {new: true})
            .then( pro => {
                par2.belong_id = _id
                return pub.reasons.create(par2)
                    .then(reason => Promise.resolve({pro, reason}))
                    .catch(err => Promise.reject(err))
            })
            .then( ({pro}) => res.send(pro))
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: id or par or par2'})
    }
}

exports.getModifyRecords = function (req, res) {
    var belong_id = req.body.id
    if(belong_id){
        pub.reasons.find({belong_id})
            .then( docs => {
                res.send(docs)
            })
            .catch( err=> res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数：id'})
    }

}

exports.proDelete = function(req, res){
    var _id = req.body.id
    if(_id){
        pro.self.deleteOne({_id})
            .then( result1 => {
                return pro.task.deleteMany({belong_id: _id})
                    .then( result2 => {
                        return Promise.resolve({result1, result2})
                    })
                    .catch(err => {
                        return Promise.reject(err)
                    })
            })
            .then( ({result1, result2}) => {
                return pub.reasons.deleteMany({belong_id: _id})
                    .then( result3 => {
                        return Promise.resolve({result1, result2, result3})
                    })
                    .catch( err => {
                        return Promise.reject(err)
                    })
            })
            .then( results => {
                res.send(results)
            })
            .catch( err => {
                res.status(400).send({error: true, message: err.message})
            })
    } else {
        res.status(400).send({error: true, message: '缺少参数: id'})
    }
}

exports.getProAndTask = function(req, res) {
    var que = {} , filter = {_id: 1, name: 1, belong_id: 1, start_time: 1, end_time: 1}
    var p1 = pro.self.find(que, filter)
    var p2 = pro.task.find(que, filter)
    Promise.all([p1,p2]).then( ([pros, tasks]) => {
        pros =  pros.map( pro => {
            var gen = function* (){
                for (var key in filter) yield key
            }
            var result = {}
            for (var key of gen()) result[key] = pro[key]
            result.task = tasks.filter( task => {
                return task.belong_id == result._id
            })
            return result
        })
        res.send(pros)
    }).catch( err => {
        res.status(400).send({error: true, message: err.message})
    })
}

exports.updateStatus = function(req, res){
    var que = req.body.que,  par = req.body.par
    if(que && par){
        que = JSON.parse(que)
        par = JSON.parse(par)
        pro.self.findByIdAndUpdate(que, par, {new: true})
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
        pro.self.findOne(que)
            .then(doc => res.send(doc))
            .catch( err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数: que'})
    }
}

