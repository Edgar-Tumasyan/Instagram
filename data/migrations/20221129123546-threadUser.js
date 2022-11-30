const { DataTypes } = require('sequelize');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('threadUser', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            threadId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'thread', key: 'id' },
                onDelete: 'Cascade'
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('threadUser');
    }
};
