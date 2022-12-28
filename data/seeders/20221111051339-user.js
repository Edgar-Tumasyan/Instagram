const { v4: uuidV4 } = require('uuid');
const faker = require('@faker-js/faker');

const { UserRole } = require('../lcp/');

module.exports = {
    up: async function (queryInterface) {
        const users = [];

        for (let i = 0; i < 10; i++) {
            users.push({
                id: uuidV4(),
                role: UserRole.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastname: faker.name.lastName(),
                firstname: faker.name.firstName(),
                email: `instagram${i}@mailinator.com`,
                password: '$2b$10$2JLJTkaQzaFposUNn4AMDuuB0cQ0vp2MZNbRBO0buKpZhfmsCVem6' // secret
            });
        }

        await queryInterface.bulkInsert('user', users, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('user', null, {});
    }
};
