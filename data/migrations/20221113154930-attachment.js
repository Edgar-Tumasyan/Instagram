const { DataTypes } = require('sequelize');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('attachment', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            postId: {
                type: DataTypes.UUID,
                references: { model: 'post', key: 'id' },
                onDelete: 'Cascade'
            },
            userId: {
                type: DataTypes.UUID,
                references: { model: 'user', key: 'id' },
                onDelete: 'Cascade'
            },
            attachmentUrl: { type: Sequelize.DataTypes.STRING, allowNull: false },
            attachmentPublicId: { type: Sequelize.DataTypes.STRING, allowNull: false },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('attachment');
    }
};
