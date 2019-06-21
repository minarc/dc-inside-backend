var express = require('express')
var router = express.Router()
let path = require('path')
const redis = require('redis')

let redisClient = redis.createClient({
  host: 'redis-10317.c16.us-east-1-3.ec2.cloud.redislabs.com',
  port: 10317,
  password: 'WCkaZYzyhYR62p42VddCJba7Kn14vdvw'
})

let redisSADD = redis.createClient({
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
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  redisClient.subscribe('dc')
  redisClient.on('message', (c, message) => {
    res.write('data: ' + message + '\n\n')
  })
})

router.get('/api/depress', (req, res, next) => {
  console.log(req.query.hash)

  redisSADD.SADD('depress', req.query.hash, (err, response) => {
    console.log(response)
    console.log(err)
    res.send()
  })
})

router.get('/api/restore', (req, res, next) => {
  redisSADD.SREM('depress', req.query.hash, (err, response) => {
    console.log(response)
    console.log(err)
    res.send()
  })
})

module.exports = router
