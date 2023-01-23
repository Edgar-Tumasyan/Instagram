require('dotenv').config();

module.exports = {
    PORT: process.env.PORT,
    API_URL: process.env.API_URL,

    SENDER_EMAIL: process.env.SENDER_EMAIL,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,

    EXPIRES_IN: process.env.EXPIRES_IN,
    EXPIRES_IN_RESET_PASSWORD: process.env.EXPIRES_IN_RESET_PASSWORD,

    JWT_SECRET: process.env.JWT_SECRET,
    JWT_SECRET_RESET_PASSWORD: process.env.JWT_SECRET_RESET_PASSWORD,

    cloudinary: {
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUD_API_KEY,
        api_secret: process.env.CLOUD_API_SECRET
    },

    db: {
        host: process.env.SQL_HOST,
        username: process.env.SQL_USER,
        dialect: process.env.SQL_DIALECT,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE
    }
};
