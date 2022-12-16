const _ = require('lodash');

const { UserRole, ProfileCategory, UserStatus } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('user', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true,
                allowNull: false
            },
            firstname: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: { len: { args: [3, 12] } }
            },
            lastname: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: { len: { args: [3, 12] } }
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true,
                validate: { isEmail: true }
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
                validate: { len: { args: [6, 14] } }
            },
            role: {
                allowNull: false,
                type: Sequelize.ENUM,
                values: _.values(UserRole),
                defaultValue: UserRole.USER
            },
            status: {
                type: Sequelize.ENUM,
                allowNull: false,
                values: _.values(UserStatus),
                defaultValue: UserStatus.Active
            },
            avatar: { type: Sequelize.DataTypes.STRING },
            avatarPublicId: { type: Sequelize.DataTypes.STRING },
            profileCategory: {
                type: Sequelize.DataTypes.ENUM,
                values: _.values(ProfileCategory),
                defaultValue: ProfileCategory.PUBLIC
            },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('user');

        await queryInterface.sequelize.query('drop type "enum_user_status";');

        await queryInterface.sequelize.query('drop type "enum_user_role";');

        await queryInterface.sequelize.query('drop type "enum_user_profileCategory";');
    }
};
