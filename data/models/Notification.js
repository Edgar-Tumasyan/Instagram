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
                    'id',
                    'type',
                    'isSeen',
                    'isRead',
                    'senderId',
                    [literal(`CASE type WHEN 'postLike' THEN 'postLike' ELSE 'userFollow' END`), 'type'],
                    [literal(`CASE type WHEN 'postLike' THEN "postId" ELSE "followId" END`), 'resourceId'],
                    [literal(`(Select firstname from "user" where id = "Notification"."senderId")`), 'firstname'],
                    [literal(`(Select lastname from "user" where id = "Notification"."senderId")`), 'lasttname']
                ],
                where: { receiverId }
            };
        });
    }
}

module.exports = Notification;
