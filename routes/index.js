var express = require('express')
var router = express.Router()
let path = require('path')
const redis = require('redis')

let redisSubscriber = redis.createClient({
  host: 'redis-10317.c16.us-east-1-3.ec2.cloud.redislabs.com',
  port: 10317,
  password: 'WCkaZYzyhYR62p42VddCJba7Kn14vdvw'
})

let redisOperation = redis.createClient({
  host: 'redis-10317.c16.us-east-1-3.ec2.cloud.redislabs.com',
  port: 10317,
  password: 'WCkaZYzyhYR62p42VddCJba7Kn14vdvw'
})

/* GET home page. */
router.get('/api/sse', (req, res, next) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  })

  redisSubscriber.subscribe('dc')
  redisSubscriber.on('message', (c, message) => {
    res.write('data: ' + message + '\n\n')
  })
})

router.get('/api/depress', (req, res, next) => {
  console.log(req.query.hash)

  redisOperation.SADD('depress', req.query.hash, (error, response) => {
    if (error) {
      res.sendStatus(400)
    }
    res.send(response)
  })
})

router.get('/api/restrict', (req, res, next) => {
  redisOperation.SMOVE('depress', 'restrict', req.query.hash, (error, response) => {
    if (error) {
      res.sendStatus(400)
    }
    res.send(response)
  })
})

router.get('/api/restore', (req, res, next) => {
  redisOperation.SREM('depress', req.query.hash, (error, response) => {
    if (error) {
      res.sendStatus(400)
    }
    res.send(response)
  })
})

module.exports = router
