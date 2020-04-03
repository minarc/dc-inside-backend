module.exports = {
  apps: [
    {
      name: "feeder",
      script: "./bin/www",
      env: {
        PORT: 3000,
        NODE_ENV: "development",
        REDIS_HOST: "34.64.196.220",
        REDIS_PORT: 6379,
        REDIS_PASSWORD: "WCkaZYzyhYR62p42VddCJba7Kn14vdvw"
      },
      env_production: {
        PORT: 80,
        NODE_ENV: "production",
        REDIS_HOST: "127.0.0.1",
        REDIS_PORT: 6379,
        REDIS_PASSWORD: "WCkaZYzyhYR62p42VddCJba7Kn14vdvw"
      }
    }
  ]
};
