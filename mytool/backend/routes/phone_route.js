var express = require('express')
var router = new express.Router()
var logic = require('../logic/phone_logic.js')

router.post('/create', logic.create)

router.post('/find', logic.find)

router.post('/delete', logic.delete)

router.post('/flowQuery', logic.getFlow)

module.exports = router
