const _ = require('lodash');
const { DataTypes, Model, literal, Op } = require('sequelize');

const { ThreadType } = require('../lcp');

class Thread extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                type: { type: DataTypes.ENUM, values: _.values(ThreadType), defaultValue: ThreadType.DIRECT },
                chatName: { type: DataTypes.STRING, validate: { len: { args: [3, 12] } } },
                lastMessageId: { type: DataTypes.UUID }
            },
            { sequelize, timestamps: true, tableName: 'thread' }
        );
    }

    static associate(models) {
        Thread.hasMany(models.Message, { as: 'messages', foreignKey: 'threadId' });

        Thread.hasMany(models.ThreadUser, { as: 'users', foreignKey: 'threadId' });
    }

    static addScopes(models) {
        Thread.addScope('allThreads', userId => {
            const threadIds = [literal(`(SELECT "threadId" FROM "threadUser" WHERE "threadUser"."userId" = '${userId}')`)];

            return {
                attributes: [
                    'id',
                    'type',
                    'createdAt',
                    'lastMessageId',
                    [literal(`(SELECT text FROM message WHERE "id" = "Thread"."lastMessageId")`), 'message']
                ],
                include: [
                    {
                        attributes: [
                            'userId',
                            [literal(`(Select firstname from "user" where "user"."id" = users."userId")`), 'firstname'],
                            [literal(`(Select lastname from "user" where "user"."id" = users."userId")`), 'lastname']
                        ],
                        model: models.ThreadUser,
                        as: 'users'
                    }
                ],
                where: { id: { [Op.in]: threadIds } }
            };
        });

        Thread.addScope('thread', () => {
            return {
                attributes: [
                    'id',
                    'type',
                    'createdAt',
                    'lastMessageId',
                    [literal(`(SELECT text FROM message WHERE "id" = "Thread"."lastMessageId")`), 'message']
                ],
                include: [
                    {
                        attributes: [
                            'userId',
                            [literal(`(Select firstname from "user" where "user"."id" = users."userId")`), 'firstname'],
                            [literal(`(Select lastname from "user" where "user"."id" = users."userId")`), 'lastname']
                        ],
                        model: models.ThreadUser,
                        as: 'users'
                    }
                ]
            };
        });
    }
}

module.exports = Thread;
