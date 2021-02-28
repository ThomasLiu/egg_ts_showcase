/* eslint-disable @typescript-eslint/no-var-requires */

const packageJson = require('../package.json');
const { name: database } = packageJson;

const config = {
  dialect: 'mysql',
  host: process.env.EGG_MYSQL_SERVER_PORT_3306_TCP_ADDR || '127.0.0.1',
  port: process.env.EGG_MYSQL_SERVER_PORT_3306_TCP_PORT || '3306',
  database: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_DATABASE || database,
  username: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_USERNAME || 'root',
  password: process.env.EGG_MYSQL_SERVER_ENV_MYSQL_ROOT_PASSWORD || '123456',
  dialectOptions: {
    bigNumberStrings: true,
  },
};

module.exports = {
  config,
  development: config,
  test: config,
  production: config,
};
