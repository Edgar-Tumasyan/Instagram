const _ = require('lodash');

const { UserRole, ProfileCategory, UserStatus } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            firstname: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
            lastname: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
            email: { type: Sequelize.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
            password: { type: Sequelize.STRING, allowNull: false, validate: { len: { args: [6, 65] } } },
            role: { type: Sequelize.ENUM, allowNull: false, values: _.values(UserRole), defaultValue: UserRole.USER },
            status: { type: Sequelize.ENUM, allowNull: false, values: _.values(UserStatus), defaultValue: UserStatus.Active },
            avatar: { type: Sequelize.STRING },
            avatarPublicId: { type: Sequelize.STRING },
            profileCategory: { type: Sequelize.ENUM, values: _.values(ProfileCategory), defaultValue: ProfileCategory.PUBLIC },
            passwordToken: { type: Sequelize.STRING },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('user');

        await queryInterface.sequelize.query('drop type "enum_user_status";');

        await queryInterface.sequelize.query('drop type "enum_user_role";');

        await queryInterface.sequelize.query('drop type "enum_user_profileCategory";');
    }
};
