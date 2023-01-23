const _ = require('lodash');

const { ThreadType } = require('../lcp');

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('thread', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true, allowNull: false },
            type: { type: Sequelize.ENUM, values: _.values(ThreadType), defaultValue: ThreadType.DIRECT },
            chatName: { type: Sequelize.STRING, validate: { len: { args: [3, 12] } } },
            createdAt: { type: Sequelize.DATE, allowNull: false },
            updatedAt: { type: Sequelize.DATE, allowNull: false }
        });
    },
    async down(queryInterface) {
        await queryInterface.dropTable('thread');

        await queryInterface.sequelize.query('drop type enum_thread_type;');
    }
};
