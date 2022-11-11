const { v4: uuidv4 } = require('uuid');
const { faker } = require('@faker-js/faker');

module.exports = {
  up: async function (queryInterface, Sequelize) {
    const users = [];

    for (let i = 0; i < 10; i++) {
      const id = uuidv4();
      const firstname = faker.name.firstName();
      const lastname = faker.name.lastName();
      const email = faker.internet.email();
      const password =
        '$2b$10$2JLJTkaQzaFposUNn4AMDuuB0cQ0vp2MZNbRBO0buKpZhfmsCVem6';
      const role = 'user';
      const createdAt = new Date();
      const updatedAt = new Date();

      users.push({
        id,
        firstname,
        lastname,
        email,
        password,
        role,
        createdAt,
        updatedAt,
      });
    }

    await queryInterface.bulkInsert('users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  },
};
