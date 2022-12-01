const verifyToken = require('../components/verifyToken');

module.exports = async socket => {
    const { token } = socket.handshake.query;

    if (!token) {
        throw new Error('Authentication invalid');
    }

    const payload = await verifyToken(token);

    const { id } = payload;
};
