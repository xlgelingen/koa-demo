const configs = require("../config");

const knex = require("knex")({
  client: "mysql2",
  connection: {
    host: configs.mysql.host,
    port: configs.mysql.port,
    user: configs.mysql.user,
    password: configs.mysql.password,
    database: configs.mysql.database,
  },
  pool: { min: 0, max: 10, idleTimeoutMillis: 20000 },
});

module.exports = knex;
