const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DataTypes, Model, literal, Op } = require('sequelize');

const { UserRole, ProfileCategory, UserStatus, FollowStatus } = require('../lcp');
const config = require('../../config');

class User extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                firstname: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
                lastname: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
                email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
                password: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [6, 65] } } },
                role: { type: DataTypes.ENUM, values: _.values(UserRole), defaultValue: UserRole.USER },
                status: { type: DataTypes.ENUM, allowNull: false, values: _.values(UserStatus), defaultValue: UserStatus.Active },
                profileCategory: {
                    type: DataTypes.ENUM,
                    values: _.values(ProfileCategory),
                    defaultValue: ProfileCategory.PUBLIC
                },
                avatar: { type: DataTypes.STRING },
                avatarPublicId: { type: DataTypes.STRING },
                passwordToken: { type: DataTypes.STRING }
            },

            {
                sequelize,
                timestamps: true,
                tableName: 'user',
                hooks: {
                    beforeSave: async user => {
                        if (user.changed('password')) {
                            user.password = await bcrypt.hash(user.password, 10);
                        }
                    }
                }
            }
        );
    }

    static associate(models) {
        User.hasMany(models.Post, { as: 'posts', foreignKey: 'userId' });

        User.hasMany(models.Follow, { as: 'followers', foreignKey: 'followerId' });

        User.hasMany(models.Follow, { as: 'followings', foreignKey: 'followingId' });

        User.hasMany(models.Attachment, { as: 'attachments', foreignKey: 'userId' });
    }

    static filtration(filter) {
        const { status, profileCategory, ids } = filter;

        const filterCondition = {};

        if (_.values(UserStatus).includes(status)) {
            filterCondition.status = status;
        }

        if (_.values(ProfileCategory).includes(profileCategory)) {
            filterCondition.profileCategory = profileCategory;
        }

        if (!_.isEmpty(ids)) {
            filterCondition.id = { [Op.in]: filter.ids };
        }

        return filterCondition;
    }

    static addScopes(models) {
        User.addScope('profile', (profileId, userId) => {
            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    'status',
                    'profileCategory',
                    [literal(`(SELECT COUNT('*') FROM post WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [
                        literal(
                            `(SELECT COUNT('*') FROM follow WHERE "followingId" = "User"."id" and "status" = 'approved')::int`
                        ),
                        'followersCount'
                    ],
                    [
                        literal(
                            `(SELECT COUNT('*') FROM follow WHERE "followerId" = "User"."id" and "status" = 'approved')::int`
                        ),
                        'followingsCount'
                    ],
                    [
                        literal(
                            `(SELECT CASE (SELECT COALESCE((SELECT status FROM follow WHERE "followerId" =
                                    '${userId}' AND "followingId" = '${profileId}'), NULL ))
                                     WHEN 'pending' THEN 'pending'
                                     WHEN 'approved' THEN 'approved'
                                   ELSE 'unfollow'
                                   END as status)`
                        ),
                        'followStatus'
                    ]
                ]
            };
        });

        User.addScope('profiles', (userId, filter) => {
            const filterCondition = User.filtration(filter);

            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    'status',
                    'profileCategory',
                    [
                        literal(
                            `(SELECT CASE (SELECT COALESCE((SELECT status FROM follow WHERE "followerId" =
                                    '${userId}' AND "followingId" = "User"."id"), NULL ))
                                   WHEN 'pending' THEN 'pending'
                                   WHEN 'approved' THEN 'approved'
                                   ELSE 'unfollow'
                                   END as status)`
                        ),
                        'followStatus'
                    ]
                ],
                where: { id: { [Op.not]: userId }, ...filterCondition }
            };
        });

        User.addScope('followers', (followingId, userId, filter) => {
            const filterCondition = User.filtration(filter);

            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    'profileCategory',
                    'status',
                    [
                        literal(
                            `(SELECT CASE (SELECT COALESCE((SELECT status FROM follow WHERE "followerId" =
                                    '${userId}' AND "followingId" = "User"."id"), NULL ))
                                   WHEN 'pending' THEN 'pending'
                                   WHEN 'approved' THEN 'approved'
                                   ELSE 'unfollow'
                                   END as status)`
                        ),
                        'followStatus'
                    ]
                ],
                where: {
                    ...filterCondition,
                    id: {
                        [Op.in]: models.Follow.generateNestedQuery({
                            attributes: ['followerId'],
                            where: { followingId, status: FollowStatus.APPROVED }
                        })
                    }
                }
            };
        });

        User.addScope('followings', (followerId, userId, filter) => {
            const filterCondition = User.filtration(filter);

            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    'profileCategory',
                    'status',
                    [
                        literal(
                            `(SELECT CASE (SELECT COALESCE((SELECT status FROM follow WHERE "followerId" =
                                    '${userId}' AND "followingId" = "User"."id"), NULL ))
                                   WHEN 'pending' THEN 'pending'
                                   WHEN 'approved' THEN 'approved'
                                   ELSE 'unfollow'
                                   END as status)`
                        ),
                        'followStatus'
                    ]
                ],
                where: {
                    ...filterCondition,
                    id: {
                        [Op.in]: models.Follow.generateNestedQuery({
                            attributes: ['followingId'],
                            where: { followerId, status: FollowStatus.APPROVED }
                        })
                    }
                }
            };
        });

        User.addScope('likesUsers', (postId, userId, filter) => {
            const filterCondition = User.filtration(filter);

            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    'profileCategory',
                    'status',
                    [
                        literal(
                            `(SELECT CASE (SELECT COALESCE((SELECT status FROM follow WHERE "followerId" =
                                    '${userId}' AND "followingId" = "User"."id"), NULL ))
                                   WHEN 'pending' THEN 'pending'
                                   WHEN 'approved' THEN 'approved'
                                   ELSE 'unfollow'
                                   END as status)`
                        ),
                        'followStatus'
                    ]
                ],
                where: {
                    ...filterCondition,
                    id: { [Op.in]: models.Like.generateNestedQuery({ attributes: ['userId'], where: { postId } }) }
                }
            };
        });

        User.addScope('yourProfile', () => {
            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'email',
                    'role',
                    'avatar',
                    'status',
                    'profileCategory',
                    [literal(`(SELECT COUNT('*') FROM post WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [
                        literal(
                            `(SELECT COUNT('*') FROM follow WHERE "followingId" = "User"."id" and "status" = 'approved')::int`
                        ),
                        'followersCount'
                    ],
                    [
                        literal(
                            `(SELECT COUNT('*') FROM follow WHERE "followerId" = "User"."id" and "status" = 'approved')::int`
                        ),
                        'followingsCount'
                    ]
                ]
            };
        });

        User.addScope('usersForAdmin', filter => {
            const filterCondition = User.filtration(filter);

            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    'createdAt',
                    'status',
                    [literal(`(SELECT COUNT('*') FROM post WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [
                        literal(
                            `(SELECT COUNT('*') FROM follow WHERE "followingId" = "User"."id" and "status" = 'approved')::int`
                        ),
                        'followersCount'
                    ],
                    [
                        literal(
                            `(SELECT COUNT('*') FROM follow WHERE "followerId" = "User"."id" and "status" = 'approved')::int`
                        ),
                        'followingsCount'
                    ]
                ],
                where: { ...filterCondition }
            };
        });

        User.addScope('exportForAdmin', filter => {
            const filterCondition = User.filtration(filter);

            return {
                attributes: [
                    `firstname`,
                    'lastname',
                    'email',
                    'status',
                    'createdAt',
                    [literal(`(SELECT COUNT('*') FROM post WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [
                        literal(
                            `(SELECT COUNT('*') FROM follow WHERE "followingId" = "User"."id" and "status" = 'approved')::int`
                        ),
                        'followersCount'
                    ],
                    [
                        literal(
                            `(SELECT COUNT('*') FROM follow WHERE "followerId" = "User"."id" and "status" = 'approved')::int`
                        ),
                        'followingsCount'
                    ]
                ],
                where: { ...filterCondition }
            };
        });

        User.addScope('statistics', (lastYear, currentYear) => {
            return {
                attributes: [
                    [literal(`to_char("createdAt", 'Mon') `), 'name'],
                    [literal(`to_char("createdAt", 'yy')`), 'year'],
                    [literal(`Count(*)`), 'month']
                ],
                where: { createdAt: { [Op.between]: [`${lastYear}-01-01`, `${currentYear}-12-31`] } },
                group: ['name', 'year']
            };
        });
    }

    generateToken() {
        const { id, email, role } = this;

        return jwt.sign({ id, email, role }, config.JWT_SECRET, { expiresIn: config.EXPIRES_IN });
    }

    async comparePassword(password, userPassword) {
        return await bcrypt.compare(password, userPassword);
    }

    toJSON() {
        const user = this.get();

        const hiddenFields = ['password', 'passwordToken'];

        return _.omit(user, hiddenFields);
    }
}

module.exports = User;
