module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admin', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            firstname: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
            lastname: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
            email: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
            password: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [6, 14] } } },
            avatar: { type: Sequelize.STRING },
            avatarPublicId: { type: Sequelize.STRING },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('admin');
    }
};
