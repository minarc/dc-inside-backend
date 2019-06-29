var express = require('express')
var router = express.Router()
const path = require('path')
const redis = require('redis')
const request = require('request')
const fs = require('fs')
var admin = require('firebase-admin')

const serviceAccount = require('../scissor-c5cd4-firebase-adminsdk-xi9sk-c329f70d62.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://scissor-c5cd4.appspot.com'
})

let bucket = admin.storage().bucket()

// 'bucket' is an object defined in the @google-cloud/storage library.
// See https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/latest/storage/bucket
// for more details.

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

redisSubscriber.subscribe('dc')

router.get('/api/sse', (req, res, next) => {
  res.set({
    Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Access-Control-Allow-Origin': '*'
  })
  let redis_queue = []

  redisSubscriber.on('message', (c, message) => {
    redis_queue.push('data: ' + message + '\n\n')
  })

  setInterval(() => {
    for (let i = 0; i < redis_queue.length; i++) {
      res.write(redis_queue.shift())
    }
  }, 1000)
})

router.post('/api/depress', (req, res, next) => {
  redisOperation.SISMEMBER(req.body.hash, 'depress', (error, reply) => {
    if (error) {
      res.sendStatus(400)
    }

    if (reply == 0) {
      redisOperation.SADD('depress', req.body.hash, (error, response) => {
        if (error) {
          res.sendStatus(400)
        }
        res.send(
          JSON.stringify({
            result: response
          })
        )
      })
      request({ uri: req.body.url, method: 'GET', encoding: null }, (error, response, body) => {
        // const content_disposition = response.headers['content-disposition']

        // if (content_disposition !== undefined) {
        //   const extension = content_disposition
        //     .split(';')[1]
        //     .split('=')[1]
        //     .split('.')[1]
        // }

        bucket.file(req.body.hash).save(body, { validation: false, resumable: false, contentType: 'image/jpg' })
      })
    } else {
      res.send(
        JSON.stringify({
          result: 'already exist'
        })
      )
    }
  })
})

router.get('/api/restrict', (req, res, next) => {
  redisOperation.SISMEMBER(req.query.hash, 'restrict', (error, reply) => {
    if (reply == 0) {
      redisOperation.SMOVE('depress', 'restrict', req.query.hash, (error, response) => {
        if (error) {
          res.sendStatus(400)
        }
        res.send()
      })
    }
    res.send()
  })
})

router.get('/api/restore', (req, res, next) => {
  redisOperation.SREM('depress', req.query.hash, (error, response) => {
    if (error) {
      res.sendStatus(400)
    }
    res.send()
  })
})

module.exports = router
