const { DataTypes, Model } = require('sequelize');
const _ = require('lodash');
const { ThreadStatus } = require('../lcp');

class ThreadRequest extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false
                },
                senderId: { type: DataTypes.UUID, allowNull: false },
                receiverId: { type: DataTypes.UUID, allowNull: false },
                status: {
                    type: DataTypes.ENUM,
                    values: _.values(ThreadStatus),
                    defaultValue: ThreadStatus.ACCEPTED
                },
                threadId: { type: DataTypes.UUID, allowNull: false }
            },
            {
                sequelize,
                timestamps: true,
                tableName: 'threadRequest'
            }
        );
    }

    static associate(models) {
        ThreadRequest.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });

        ThreadRequest.belongsTo(models.User, { as: 'reciever', foreignKey: 'receiverId' });

        ThreadRequest.belongsTo(models.Thread, { as: 'threads', foreignKey: 'threadId' });
    }
}

module.exports = ThreadRequest;
