
var express = require('express')
var router = express.Router()

var logic = require('../logic/pro_logic')

router.post('/create', logic.create)

router.post('/find', logic.find)

router.post('/createTask', logic.createTask)

router.post('/getTask', logic.findTask)

router.post('/deleteTask', logic.deleteTask)

router.post('/modifyTask', logic.modifyTask)

router.post('/modifyPro', logic.modifyPro)

router.post('/getModifyRecords', logic.getModifyRecords)

router.post('/delete', logic.proDelete)

router.post('/getProAndTask', logic.getProAndTask)

router.post('/updateStatus', logic.updateStatus)

router.post('/verifyName', logic.verifyName)


module.exports = router