module.exports = {
    TYPE: ['ASC', 'DESC'],
    USER: {
        firstname: '"User"."firstname"',
        lastname: '"User"."lastname"',
        createdAt: '"User"."createdAt"',
        default: '"User"."createdAt"'
    },
    POST: {
        title: '"Post"."title"',
        username: 'CONCAT("user"."firstname", "user"."lastname")',
        createdAt: '"Post"."createdAt"',
        default: '"Post"."createdAt"'
    }
};
