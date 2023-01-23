module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('admin', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            firstname: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
            lastname: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
            email: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
            password: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [6, 65] } } },
            avatar: { type: Sequelize.STRING },
            avatarPublicId: { type: Sequelize.STRING },
            passwordToken: { type: Sequelize.STRING },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('admin');
    }
};
