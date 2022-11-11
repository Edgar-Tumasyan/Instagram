'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async function (queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      'users',
      [
        {
          id: '4ebcdc2e-4cd2-414b-8689-f9d4c8e890f5',
          firstname: 'John',
          lastname: 'Smith',
          email: 'johnsmith@gmail.com',
          password: 'secret',
        },
        {
          id: '283ca225-13ee-423c-bd5b-e816b318ec8d',
          firstname: 'Jаck',
          lastname: 'Mount',
          email: 'jackmount@gmail.com',
          password: 'secret',
        },
        {
          id: 'c02363d2-5f78-45d5-aa79-e79ce47f6e95',
          firstname: 'Mike',
          lastname: 'Johnson',
          email: 'mikejohnson@gmail.com',
          password: 'secret',
        },
        {
          id: 'fc8b8fd2-c024-4cdb-a4c4-e126373bbded',
          firstname: 'Steven',
          lastname: 'Williams',
          email: 'stevenwilliams@gmail.com',
          password: 'secret',
        },
        {
          id: 'a2936f1f-bd09-4ca6-8891-75f402296ba2',
          firstname: 'Anna',
          lastname: 'Miller',
          email: 'annamiller@gmail.com',
          password: 'secret',
        },
        {
          id: 'da1676e8-a513-4e66-b559-6ea671fc0ca6',
          firstname: 'Jennifer',
          lastname: 'Brown',
          email: 'jenniferbrown@gmail.com',
          password: 'secret',
        },
        {
          id: '80a95c04-0666-4f8e-b6bc-d52f5ea5964c',
          firstname: 'David',
          lastname: 'Garcia',
          email: 'davidgarcia@gmail.com',
          password: 'secret123',
        },
        {
          id: '4e2fcdec-6fd1-421c-a853-7375aa20bf87',
          firstname: 'Monika',
          lastname: 'Rodriguez',
          email: 'monika@gmail.com',
          password: 'secret1234',
        },
        {
          id: 'b6fcb3ee-fd80-442e-a478-4693ba3bdde8',
          firstname: 'Rodrygo',
          lastname: 'Lopez',
          email: 'rodrygolopez@gmail.com',
          password: 'secret1234',
        },
        {
          id: '8f8d576d-9752-4d31-ad72-2951a1f3e47f',
          firstname: 'Toni',
          lastname: 'Wilson',
          email: 'willson@gmail.com',
          password: 'secret1234',
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
      await queryInterface.bulkDelete('users', null, {});
  },
};
