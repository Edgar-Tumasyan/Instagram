require('dotenv').config();

module.exports = {
  port: process.env.PORT,
  db: {
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    dialect: process.env.SQL_DIALECT,
    username: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
  },
};
