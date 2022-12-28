const { verifyToken } = require('../components/Helpers');

const config = require('../config');

module.exports = {
    connect: io => {
        global.io = io;

        io.use(async (socket, next) => {
            const { token } = socket.handshake.query;

            if (!token) {
                return next(new Error('Authentication failed'));
            }

            const payload = await verifyToken(token, config.JWT_SECRET);

            if (!payload) {
                return next(new Error('Authentication failed'));
            }

            const { id } = payload;

            socket.join(id);

            return next();
        });
    }
};
