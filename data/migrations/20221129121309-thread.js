const _ = require('lodash');

const { ThreadType } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('thread', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            type: { type: Sequelize.ENUM, values: _.values(ThreadType), defaultValue: ThreadType.DIRECT },
            createdAt: { allowNull: false, type: Sequelize.DATE },
            updatedAt: { allowNull: false, type: Sequelize.DATE }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('thread');

        await queryInterface.sequelize.query('drop type enum_thread_type;');
    }
};
