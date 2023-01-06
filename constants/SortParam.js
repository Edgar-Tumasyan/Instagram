module.exports = {
    TYPE: ['ASC', 'DESC'],
    USER: {
        lastname: '"User"."lastname"',
        default: '"User"."createdAt"',
        createdAt: '"User"."createdAt"',
        firstname: '"User"."firstname"'
    },
    ADMIN: {
        lastname: '"Admin"."lastname"',
        default: '"Admin"."createdAt"',
        createdAt: '"Admin"."createdAt"',
        firstname: '"Admin"."firstname"'
    },
    POST: {
        title: '"Post"."title"',
        default: '"Post"."createdAt"',
        createdAt: '"Post"."createdAt"',
        username: 'CONCAT("user"."firstname", "user"."lastname")'
    }
};
