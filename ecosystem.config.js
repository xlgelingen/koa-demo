// Options reference:
// https://pm2.keymetrics.io/docs/usage/application-declaration/

module.exports = {
  apps: [
    {
      name: "x-service",
      script: "./app.js",
    },
  ],
};
