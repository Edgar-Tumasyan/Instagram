// const { v4: uuidV4 } = require('uuid');
// const faker = require('@faker-js/faker');
//
// module.exports = {
//     up: async function (queryInterface) {
//         const admin = [];
//
//         for (let i = 0; i < 1; i++) {
//             admin.push({
//                 id: uuidV4(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 lastname: faker.name.lastName(),
//                 firstname: faker.name.firstName(),
//                 email: `admin${i}@mailinator.com`,
//                 password: '$2b$10$2JLJTkaQzaFposUNn4AMDuuB0cQ0vp2MZNbRBO0buKpZhfmsCVem6' // secret
//             });
//         }
//
//         await queryInterface.bulkInsert('admin', admin, {});
//     },
//
//     async down(queryInterface) {
//         await queryInterface.bulkDelete('admin', null, {});
//     }
// };
