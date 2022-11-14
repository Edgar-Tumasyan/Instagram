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
  JWT_SECRET: process.env.JWT_SECRET,
  cloudinary: {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
  },

};
