const { v4: uuidV4 } = require('uuid');
const faker = require('@faker-js/faker');

const { UserRole } = require('../lcp/');

module.exports = {
    up: async function (queryInterface) {
        const users = [];
        const posts = [];

        for (let i = 0; i < 10; i++) {
            users.push({
                id: `82c8b943-29af-4f57-9ae3-2568ee14eb3${i}`,
                role: UserRole.USER,
                createdAt: new Date(),
                updatedAt: new Date(),
                lastname: faker.name.lastName(),
                firstname: faker.name.firstName(),
                email: `instagram${i}@mailinator.com`,
                password: '$2b$10$2JLJTkaQzaFposUNn4AMDuuB0cQ0vp2MZNbRBO0buKpZhfmsCVem6' // secret
            });

            for (let j = 0; j < 5; j++) {
                posts.push({
                    id: uuidV4(),
                    description: 'New description',
                    title: 'New title',
                    userId: `82c8b943-29af-4f57-9ae3-2568ee14eb3${i}`,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }

        await queryInterface.bulkInsert('user', users, {});

        await queryInterface.bulkInsert('post', posts, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('user', null, {});

        await queryInterface.bulkDelete('post', null, {});
    }
};
