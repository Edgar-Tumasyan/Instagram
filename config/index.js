require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,

    EXPIRES_IN: '10d',
    JWT_SECRET: process.env.JWT_SECRET,

    db: {
        host: process.env.SQL_HOST,
        username: process.env.SQL_USER,
        dialect: process.env.SQL_DIALECT,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE
    },

    cloudinary: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    }
};
