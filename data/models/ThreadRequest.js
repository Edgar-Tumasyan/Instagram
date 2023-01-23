const _ = require('lodash');
const { DataTypes, Model, Op } = require('sequelize');

const { ThreadStatus } = require('../lcp');

class ThreadRequest extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                status: { type: DataTypes.ENUM, values: _.values(ThreadStatus), defaultValue: ThreadStatus.ACCEPTED }
            },
            { sequelize, timestamps: true, tableName: 'threadRequest' }
        );
    }

    static associate(models) {
        ThreadRequest.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });

        ThreadRequest.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });

        ThreadRequest.belongsTo(models.Thread, { as: 'threads', foreignKey: 'threadId' });
    }

    static addScopes(models) {
        ThreadRequest.addScope('existingThread', (userId, profileId) => {
            return {
                where: {
                    [Op.or]: [
                        { senderId: userId, receiverId: profileId },
                        { senderId: profileId, receiverId: userId }
                    ]
                }
            };
        });

        ThreadRequest.addScope('existingChat', (chatName, userId) => {
            return {
                attributes: ['threadId'],
                include: [{ attributes: [], model: models.Thread, as: 'threads', where: { chatName } }],
                where: { [Op.or]: [{ senderId: userId }, { receiverId: userId }] }
            };
        });
    }
}

module.exports = ThreadRequest;
