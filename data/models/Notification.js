const { DataTypes, Model, literal } = require('sequelize');
const { NotificationType } = require('../lcp');
const _ = require('lodash');

class Notification extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false
                },
                type: { type: DataTypes.ENUM, values: _.values(NotificationType), allowNull: false },
                isSeen: { type: DataTypes.BOOLEAN, defaultValue: false },
                isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
            },
            {
                sequelize,
                timestamps: true,
                tableName: 'notification'
            }
        );
    }

    static associate(models) {
        Notification.belongsTo(models.User, { as: 'sender', foreignKey: 'senderId' });

        Notification.belongsTo(models.User, { as: 'receiver', foreignKey: 'receiverId' });

        Notification.belongsTo(models.Post, { as: 'post', foreignKey: 'postId' });

        Notification.belongsTo(models.Follow, { as: 'follow', foreignKey: 'followId' });
    }

    static addScopes() {
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
                    'isSeen',
                    'type'
                ],
                where: { receiverId },
                group: ['id', 'type'],
                order: [['createdAt', 'DESC']]
            };
        });

        // Notification.addScope('allNotifications', receiverId => {
        //     return {
        //         attributes: [
        //             [literal(`DISTINCT (CASE type WHEN 'postLike' THEN "postId" ELSE id END )`), 'id'],
        //             [literal(`CASE type WHEN 'postLike' THEN "postId" ELSE "followId" END `), 'resourceId'],
        //             [
        //                 literal(`CASE type WHEN 'postLike' THEN (SELECT "senderId" FROM notification WHERE
        //                                "postId" = (SELECT id FROM post WHERE id = "Notification"."postId") AND
        //                                "createdAt" = (SELECT MAX("createdAt") FROM notification WHERE "postId" =
        //                                "Notification"."postId"))
        //                              ELSE "senderId" END`),
        //                 'senderId'
        //             ],
        //             [
        //                 literal(`CASE type WHEN 'postLike' THEN (SELECT firstname FROM "user" WHERE id =
        //                                (SELECT "senderId" FROM notification WHERE "postId" =
        //                                (SELECT id FROM post WHERE id = "Notification"."postId") AND
        //                                "createdAt" = (SELECT MAX("createdAt") FROM notification WHERE "postId" =
        //                                "Notification"."postId")))
        //                              ELSE (SELECT firstname FROM "user" WHERE id = "Notification"."senderId") END`),
        //                 'firstname'
        //             ],
        //             [
        //                 literal(`CASE type WHEN 'postLike' THEN (SELECT lastname FROM "user" WHERE id =
        //                                (SELECT "senderId" FROM notification WHERE "postId" =
        //                                (SELECT id FROM post WHERE id = "Notification"."postId") AND
        //                                "createdAt" = (SELECT MAX("createdAt") FROM notification WHERE "postId" =
        //                                "Notification"."postId")))
        //                              ELSE (SELECT lastname FROM "user" WHERE id = "Notification"."senderId") END`),
        //                 'lastname'
        //             ],
        //             [
        //                 literal(
        //                     `CASE type WHEN 'postLike' THEN (SELECT count('*') FROM "like" WHERE "postId" = "Notification"."postId")
        //                      ELSE null END`
        //                 ),
        //                 'likesCount'
        //             ],
        //             [
        //                 literal(
        //                     `CASE type WHEN 'postLike' THEN (SELECT MAX("createdAt") FROM notification WHERE "postId" = "Notification"."postId")
        //                      ELSE "createdAt" END`
        //                 ),
        //                 'createdAt'
        //             ],
        //             'isSeen',
        //             'type'
        //         ],
        //         where: { receiverId },
        //         group: ['id', 'type'],
        //         order: [['createdAt', 'DESC']]
        //     };
        // });
    }
}

module.exports = Notification;
