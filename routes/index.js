var express = require("express");
var router = express.Router();
const path = require("path");
const async_redis = require("async-redis");
const request = require("request");
const fs = require("fs");
var admin = require("firebase-admin");

const serviceAccount = require("../scissor-c5cd4-firebase-adminsdk-xi9sk-c329f70d62.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://scissor-c5cd4.appspot.com"
});

let bucket = admin.storage().bucket();

// 'bucket' is an object defined in the @google-cloud/storage library.
// See https://googlecloudplatform.github.io/google-cloud-node/#/docs/storage/latest/storage/bucket
// for more details.

let redisSubscriber = async_redis.createClient({
  host: "redis-10317.c16.us-east-1-3.ec2.cloud.redislabs.com",
  port: 10317,
  password: "WCkaZYzyhYR62p42VddCJba7Kn14vdvw"
});

let redisOperation = async_redis.createClient({
  host: "redis-10317.c16.us-east-1-3.ec2.cloud.redislabs.com",
  port: 10317,
  password: "WCkaZYzyhYR62p42VddCJba7Kn14vdvw"
});

redisSubscriber.subscribe("dc");

router.get("/api/sse", (req, res, next) => {
  res.set({
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*"
  });

  res.write("id: " + Date.now() + "\n");
  res.write("event: welcome" + "\n");

  redisSubscriber.on("message", (c, message) => {
    res.write("id: " + Date.now() + "\n");
    res.write("data: " + message + "\n\n");
  });
});

router.post("/api/depress", (req, res, next) => {
  (async _ => {
    const reply = await redisOperation.sismember(req.body.hash, "depress");
    if (reply == 0 && !req.body.url.includes("thumb")) {
      const result = await redisOperation.sadd("depress", req.body.hash);
      request({ uri: req.body.url, method: "GET", encoding: null }, (error, response, body) => {
        bucket.file(req.body.hash).save(body, { validation: false, resumable: false, contentType: "image/jpg" });
      });
      res.send(
        JSON.stringify({
          result: result
        })
      );
    } else {
      res.send();
    }
  })();
});

router.get("/api/restrict", (req, res, next) => {
  redisOperation.sismember(req.query.hash, "restrict", (error, reply) => {
    if (reply == 0) {
      redisOperation.smove("depress", "restrict", req.query.hash, (error, response) => {
        if (error) {
          res.sendStatus(400);
        }
        res.send();
      });
    }
    res.send();
  });
});

router.get("/api/restore", (req, res, next) => {
  (async _ => {
    const reply = await redisOperation.srem("depress", req.query.hash);
  })();
});

module.exports = router;
