const _ = require('lodash');
const { DataTypes, Model, literal } = require('sequelize');

const { NotificationType } = require('../lcp');

class Notification extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                type: { type: DataTypes.ENUM, values: _.values(NotificationType), allowNull: false },
                isSeen: { type: DataTypes.BOOLEAN, defaultValue: false },
                isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
            },
            { sequelize, timestamps: true, tableName: 'notification' }
        );
    }

    static associate(models) {
        Notification.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });

        Notification.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });

        Notification.belongsTo(models.Post, { as: 'post', foreignKey: 'postId' });

        Notification.belongsTo(models.Follow, { as: 'follow', foreignKey: 'followId' });
    }

    static addScopes() {
        Notification.addScope('count', receiverId => {
            return {
                attributes: [[literal(`COUNT(DISTINCT (CASE type WHEN 'postLike' THEN "postId" ELSE id END ))`), 'count']],
                where: { receiverId }
            };
        });

        Notification.addScope('allNotifications', receiverId => {
            return {
                attributes: [
                    [literal(`DISTINCT (CASE type WHEN 'postLike' THEN "postId" ELSE id END )`), 'id'],
                    [literal(`CASE type WHEN 'postLike' THEN "postId" ELSE "followId" END `), 'resourceId'],
                    [
                        literal(`CASE type WHEN 'postLike' THEN (SELECT "senderId" FROM notification WHERE
                                       "postId" = (SELECT id FROM post WHERE id = "Notification"."postId") AND
                                       "createdAt" = (SELECT MAX("createdAt") FROM notification WHERE "postId" = 
                                       "Notification"."postId")) 
                                     ELSE "senderId" END`),
                        'senderId'
                    ],
                    [
                        literal(`CASE type WHEN 'postLike' THEN (SELECT count('*') FROM "like" WHERE "postId" = "Notification"."postId")
                             ELSE null END`),
                        'likesCount'
                    ],
                    [
                        literal(`CASE type WHEN 'postLike' THEN (SELECT MAX("createdAt") FROM notification WHERE "postId" = "Notification"."postId")
                             ELSE "createdAt" END`),
                        'createdAt'
                    ],
                    'type'
                ],
                where: { receiverId },
                group: ['id'],
                order: [['createdAt', 'DESC']]
            };
        });
    }
}

module.exports = Notification;
