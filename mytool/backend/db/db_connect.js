//连接数据库
var mongoose = require('mongoose')
module.exports = function(url){
    mongoose.connect(url, {useNewUrlParser: true, useFindAndModify: false}, function (err, db) {
        if(err){
            console.error(err.message)
        }else if(db){
            console.log('dbServer connected to: ' + url)
        }
    })
}



