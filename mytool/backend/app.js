var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//配置跨访问
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    next();
})

//配置路由
var pro_route = require('./routes/pro_route')
app.use('/pro', pro_route)

var node_route = require('./routes/node_route')
app.use('/node', node_route)

var phone_route = require('./routes/phone_route')
app.use('/phone', phone_route)

// catch 404
app.use(function(req, res) {
    res.status(404)
    res.send('Not Found')
});

//连接数据库
var url = 'mongodb://localhost:27017/tool'
require('./db/db_connect')(url)

//开启定时任务每日24点更新项目及节点状态
require('./logic/update_status')()

module.exports = app;
