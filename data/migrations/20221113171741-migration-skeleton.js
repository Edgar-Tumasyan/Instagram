module.exports = {
    async up(queryInterface, Sequelize) {},

    async down(queryInterface) {
        await queryInterface.removeColumn('posts', 'title');
    }
};
