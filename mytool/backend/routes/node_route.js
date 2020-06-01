var express = require('express')
var router = express.Router()

var logic = require('../logic/node_logic')

router.post('/create', logic.create)

router.post('/find', logic.find)

router.post('/setBody', logic.setBody)

router.post('/delete', logic.nodeDelete)

router.post('/updateStatus', logic.updateStatus)

router.post('/verifyName', logic.verifyName)

router.post('/update', logic.update)

router.post('/getUpdateRecord', logic.getUpdateRecord)

module.exports =  router