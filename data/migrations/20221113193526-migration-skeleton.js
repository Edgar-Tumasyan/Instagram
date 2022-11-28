module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('attachments', 'attachmentUrl', {
            type: Sequelize.DataTypes.STRING,
            allowNull: false
        });
    },

    async down(queryInterface) {
        await queryInterface.removeColumn('attachments', 'attachmentUrl');
    }
};
