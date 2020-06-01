//时间格式话工具
var dateFormat = require('dateformat')
//项目集合控制器
var pro = require('../db/db_pro')
//节点集合控制器
var node = require('../db/db_node.js')

module.exports = function(){
    //当天零点时间
    var zeroTime = dateFormat(Date.now(), 'yyyy-mm-dd')
    //到当天24点还有多久
    var time = (1000*60*60*16) - (Date.now() - new Date(zeroTime).getTime())
    //开启定时任务
    setTimeout(function(){
        updateStatus(pro)
        updateStatus(node)
        setInterval(function(){
            updateStatus(pro)
            updateStatus(node)
        }, 1000*60*60*24)
    }, time)
    console.log('定时更新项目节点状态任务启动成功')
}


//更新函数
function updateStatus(collection){
    collection.find({},function(err,docs){
        if(err){
            console.log(err.message)
        } else {
            docs.forEach(function(item){
                logic(item)
            })
        }
    })
    //更新逻辑
    function logic(item){
        switch (item.status){
            case 0:
                if(Date.now() >= item.start_time.getTime()){
                    item.status = 1
                    item.save()
                }
                break
            case 1:
                if(Date.now() >= item.end_time.getTime()){
                    item.status = 2
                    item.save()
                }
        }
    }
}

