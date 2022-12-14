const _ = require('lodash');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admin', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            firstname: { type: Sequelize.STRING, allowNull: false },
            lastname: { type: Sequelize.STRING, allowNull: false },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: { isEmail: true }
            },
            password: { type: Sequelize.STRING, allowNull: false },
            avatar: { type: Sequelize.DataTypes.STRING },
            avatarPublicId: { type: Sequelize.DataTypes.STRING },

            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('admin');
    }
};
