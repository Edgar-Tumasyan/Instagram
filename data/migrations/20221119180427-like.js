const { DataTypes } = require('sequelize');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('like', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            userId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            postId: {
                type: DataTypes.UUID,
                allowNull: false,
                references: { model: 'post', key: 'id' },
                onDelete: 'Cascade'
            },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('like');
    }
};
