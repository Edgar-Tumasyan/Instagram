const { NotificationType } = require('../lcp/');
const { DataTypes } = require('sequelize');
const _ = require('lodash');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('notification', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            type: {
                type: DataTypes.ENUM,
                values: _.values(NotificationType),
                allowNull: false
            },
            senderId: {
                type: DataTypes.UUID,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            receiverId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            followId: {
                type: DataTypes.UUID,
                references: { model: 'follow', key: 'id' },
                onDelete: 'Cascade'
            },
            postId: {
                type: DataTypes.UUID,
                references: { model: 'post', key: 'id' },
                onDelete: 'Cascade'
            },
            isSeen: { type: DataTypes.BOOLEAN, defaultValue: false },
            isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('notification');

        await queryInterface.sequelize.query('drop type "enum_notification_type";');
    }
};
