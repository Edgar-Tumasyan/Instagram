const { DataTypes } = require('sequelize');
const _ = require('lodash');

const { ThreadStatus } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('threadRequest', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            senderId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            receiverId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            status: {
                type: DataTypes.ENUM,
                values: _.values(ThreadStatus),
                defaultValue: ThreadStatus.ACCEPTED
            },
            threadId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'thread', key: 'id' },
                onDelete: 'Cascade'
            },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('threadRequest');

        await queryInterface.sequelize.query('drop type "enum_threadRequest_status";');
    }
};
