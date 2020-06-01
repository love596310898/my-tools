//商户电话collection
var phone = require('../db/db_client_phone.js')
//http请求插件
var request = require('request')

exports.create = function(req, res){
    var par = req.body.par
    if(par){
        par = JSON.parse(par)
        phone.create(par)
            .then( doc => res.send(doc))
            .catch( err=> res.status(400).send(err))
    } else {
        res.status(400).send({error:true, message: '缺少参数：par'})
    }
}

exports.find = function(req, res){
    var que = req.body.que
    if( que) {
        que = JSON.parse(que)
    } else {
        que = {}
    }
    phone.find(que)
        .then(docs => res.send(docs))
        .catch(err => res.status(400).send(err))

}

exports.delete = function(req, res){
    var query = req.body.query
    if(query){
        query = JSON.parse(query)
        phone.deleteMany(query)
            .then(result => res.send(result))
            .catch(err => res.status(400).send(err))
    } else {
        res.status(400).send({error: true, message: '缺少参数：query'})
    }
}

exports.getFlow = function(req, res){
    var proxy_url = req.body.url, iccid = req.body.iccid
    if(proxy_url && iccid){
        var params = {iccid}
        function callback(error, response, data) {
            res.status(response.statusCode)
            if (!error && response.statusCode == 200) {
                res.send(data)
            } else {
                res.send(error)
            }
        }
        request.post(proxy_url, {form: params}, callback);
    } else {
        res.status(400).send({erroe: true, message: '缺少参数：proxy_url or iccid'})
    }
}
