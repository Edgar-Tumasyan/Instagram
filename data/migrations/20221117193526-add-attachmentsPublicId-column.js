module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('attachments', 'attachmentPublicId', {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('attachments', 'attachmentPublicId');
    }
};
