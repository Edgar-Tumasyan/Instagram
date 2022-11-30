const { DataTypes } = require('sequelize');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('post', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            description: { type: DataTypes.STRING, allowNull: false },
            title: { type: Sequelize.DataTypes.STRING, allowNull: false },
            userId: {
                type: DataTypes.UUID,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('post');
    }
};
