const _ = require('lodash');

const { NotificationType } = require('../lcp/');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('notification', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            type: { type: Sequelize.ENUM, values: _.values(NotificationType), allowNull: false },
            senderId: { type: Sequelize.UUID, references: { model: 'user', key: 'id' }, onDelete: 'Cascade' },
            receiverId: { type: Sequelize.UUID, allowNull: false, references: { model: 'user', key: 'id' }, onDelete: 'Cascade' },
            followId: { type: Sequelize.UUID, references: { model: 'follow', key: 'id' }, onDelete: 'Cascade' },
            postId: { type: Sequelize.UUID, references: { model: 'post', key: 'id' }, onDelete: 'Cascade' },
            isSeen: { type: Sequelize.BOOLEAN, defaultValue: false },
            isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('notification');

        await queryInterface.sequelize.query('drop type "enum_notification_type";');
    }
};
