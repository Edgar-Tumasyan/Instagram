const { v4: uuidV4 } = require('uuid');
const faker = require('@faker-js/faker');

const { UserRole } = require('../lcp/');

module.exports = {
    up: async function (queryInterface) {
        const users = [];

        for (let i = 0; i < 10; i++) {
            users.push({
                id: uuidV4(),
                firstname: faker.name.firstName(),
                lastname: faker.name.lastName(),
                email: `instagram${i}@mailinator.com`,
                password: '$2b$10$2JLJTkaQzaFposUNn4AMDuuB0cQ0vp2MZNbRBO0buKpZhfmsCVem6', // secret
                role: UserRole.USER,
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        await queryInterface.bulkInsert('user', users, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('user', null, {});
    }
};
