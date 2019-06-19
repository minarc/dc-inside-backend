var express = require('express')
var router = express.Router()
let path = require('path')
const redis = require('redis')

let redisClient = redis.createClient({
  host: 'redis-10317.c16.us-east-1-3.ec2.cloud.redislabs.com',
  port: 10317,
  password: 'WCkaZYzyhYR62p42VddCJba7Kn14vdvw'
})

/* GET home page. */
router.get('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'))
})

router.get('/api/sse', (req, res, next) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  redisClient.subscribe('dc')
  redisClient.on('message', (c, message) => {
    res.write('data: ' + message + '\n\n')
  })
})

router.get('/api/hide', function(req, res, next) {
  res.render('index', { title: '' })
})

module.exports = router
