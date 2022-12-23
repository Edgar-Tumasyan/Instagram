const _ = require('lodash');

const exporterNormalizer = async users => {
    if (_.isUndefined(...users)) {
        return {
            'First Name': undefined,
            'Last Name': undefined,
            Email: undefined,
            Date: undefined,
            Status: undefined,
            'Posts Count': undefined,
            'Followers Count': undefined,
            'Followings Count': undefined
        };
    }

    return users.map(user => {
        user.createdAt = user.createdAt.toLocaleDateString();
        user.status = user.status.charAt(0).toUpperCase() + user.status.slice(1);

        user['First Name'] = user.firstname;
        user['Last Name'] = user.lastname;
        user.Email = user.email;
        user.Date = user.createdAt;
        user.Status = user.status;
        user['Posts Count'] = user.postsCount;
        user['Followers Count'] = user.followersCount;
        user['Followings Count'] = user.followingsCount;

        return _.omit(user, [
            'email',
            'status',
            'lastname',
            'createdAt',
            'firstname',
            'postsCount',
            'followersCount',
            'followingsCount'
        ]);
    });
};

module.exports = exporterNormalizer;
