var express = require("express");
var router = express.Router();
const async_redis = require("async-redis");
const request = require("request");

let baseballSubscriber = async_redis.createClient({
  host: "127.0.0.1",
  port: 6379,
  password: "WCkaZYzyhYR62p42VddCJba7Kn14vdvw"
});
baseballSubscriber.subscribe("baseball");
baseballSubscriber.setMaxListeners(100);

let streamSubscriber = async_redis.createClient({
  host: "127.0.0.1",
  port: 6379,
  password: "WCkaZYzyhYR62p42VddCJba7Kn14vdvw"
});
streamSubscriber.subscribe("streamer");
streamSubscriber.setMaxListeners(100);

let redisOperation = async_redis.createClient({
  host: "127.0.0.1",
  port: 6379,
  password: "WCkaZYzyhYR62p42VddCJba7Kn14vdvw"
});

redisOperation.on("error", err => {
  console.log(err);
});

router.get("/", (req, res) => {
  res.send(new Date().toUTCString());
});

router.get("/api/init/:channel", async (req, res, next) => {
  try {
    res.json(await redisOperation.get(req.params.channel));
  } catch (err) {
    res.status(418).json(err);
  }
});

router.get("/api/sse/:channel", async (req, res, next) => {
  res.set({
    Connection: "keep-alive",
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Access-Control-Allow-Origin": "*"
  });

  res.write(`id: ${Date.now()}\n`);
  res.write(`event: welcome\n`);

  if (req.params.channel === "streamer") {
    streamSubscriber.on("message", (c, message) => {
      res.write(`id: ${Date.now()}\n`);
      res.write(`data: ${message}\n\n`);
    });
  } else if (req.params.channel === "baseball") {
    baseballSubscriber.on("message", (c, message) => {
      res.write(`id: ${Date.now()}\n`);
      res.write(`data: ${message}\n\n`);
    });
  }
});

router.post("/api/depress", (req, res, next) => {
  (async _ => {
    const reply = await redisOperation.sismember(req.body.hash, "depress");
    if (reply == 0 && !req.body.url.includes("thumb")) {
      const result = await redisOperation.sadd("depress", req.body.hash);
      request(
        { uri: req.body.url, method: "GET", encoding: null },
        (error, response, body) => {
          bucket.file(req.body.hash).save(body, {
            validation: false,
            resumable: false,
            contentType: "image/jpg"
          });
        }
      );
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
      redisOperation.smove(
        "depress",
        "restrict",
        req.query.hash,
        (error, response) => {
          if (error) {
            res.sendStatus(400);
          }
          res.send();
        }
      );
    }
    res.send();
  });
});

module.exports = router;
