const { DataTypes, Model, literal, Op } = require('sequelize');
const _ = require('lodash');

const { ThreadType } = require('../lcp');

class Thread extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false
                },
                type: {
                    type: DataTypes.ENUM,
                    values: _.values(ThreadType),
                    defaultValue: ThreadType.DIRECT
                },
                lastMessageId: { type: DataTypes.UUID }
            },
            {
                sequelize,
                timestamps: true,
                tableName: 'thread'
            }
        );
    }

    static associate(models) {
        Thread.hasMany(models.Message, { as: 'messages', foreignKey: 'threadId' });

        Thread.hasMany(models.ThreadUser, { as: 'users', foreignKey: 'threadId' });
    }

    static addScopes() {
        Thread.addScope('allThreads', userId => {
            const threadIds = [literal(`(SELECT "threadId" FROM "threadUser" WHERE "threadUser"."userId" = '${userId}')`)];

            return {
                attributes: [
                    'id',
                    'type',
                    'lastMessageId',
                    [literal(`(SELECT text FROM message WHERE "id" = "Thread"."lastMessageId")`), 'message']
                ],
                where: { id: { [Op.in]: threadIds } }
            };
        });
    }
}

module.exports = Thread;
