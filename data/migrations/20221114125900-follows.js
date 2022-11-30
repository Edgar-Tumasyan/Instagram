const { DataTypes } = require('sequelize');
const _ = require('lodash');
const { FollowStatus } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('follow', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            followerId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            followingId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            status: {
                type: Sequelize.DataTypes.ENUM,
                values: _.values(FollowStatus),
                defaultValue: FollowStatus.APPROVED
            },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('follow');

        await queryInterface.sequelize.query('drop type enum_follow_status;');
    }
};
