module.exports = {
  apps: [
    {
      name: "feeder",
      script: "./bin/www",
      env: {
        PORT: 8080,
        NODE_ENV: "development"
      },
      env_production: {
        PORT: 80,
        NODE_ENV: "production"
      }
    }
  ]
};
