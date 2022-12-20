const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DataTypes, Model, literal, Op } = require('sequelize');

const config = require('../../config');
const { UserRole, ProfileCategory, UserStatus } = require('../lcp');

class User extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                firstname: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
                lastname: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
                email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
                password: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [6, 14] } } },
                role: { type: DataTypes.ENUM, values: _.values(UserRole), defaultValue: UserRole.USER },
                status: { type: DataTypes.ENUM, allowNull: false, values: _.values(UserStatus), defaultValue: UserStatus.Active },
                profileCategory: {
                    type: DataTypes.ENUM,
                    values: _.values(ProfileCategory),
                    defaultValue: ProfileCategory.PUBLIC
                },
                avatar: DataTypes.STRING,
                avatarPublicId: DataTypes.STRING
            },

            {
                sequelize,
                timestamps: true,
                tableName: 'user',
                hooks: {
                    beforeCreate: async user => {
                        user.password = await bcrypt.hash(user.password, 10);
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

    generateToken() {
        const { id, email, role } = this;

        return jwt.sign({ id, email, role }, config.JWT_SECRET, { expiresIn: config.EXPIRES_IN });
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
                    [literal(`(SELECT COUNT('*') FROM post WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [literal(`(SELECT COUNT('*') FROM follow WHERE "followingId" = "User"."id")::int`), 'followersCount'],
                    [literal(`(SELECT COUNT('*') FROM follow WHERE "followerId" = "User"."id")::int`), 'followingsCount'],
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

        User.addScope('profiles', userId => {
            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
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
                where: { id: { [Op.not]: userId } }
            };
        });

        User.addScope('followers', (followingId, userId) => {
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
                    id: { [Op.in]: models.Follow.generateNestedQuery({ attributes: ['followerId'], where: { followingId } }) }
                }
            };
        });

        User.addScope('followings', (followerId, userId) => {
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
                    id: { [Op.in]: models.Follow.generateNestedQuery({ attributes: ['followingId'], where: { followerId } }) }
                }
            };
        });

        User.addScope('likesUsers', (postId, userId) => {
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
                    id: {
                        [Op.in]: models.Like.generateNestedQuery({ attributes: ['userId'], where: { postId } })
                    }
                }
            };
        });

        User.addScope('yourProfile', () => {
            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    'status',
                    [literal(`(SELECT COUNT('*') FROM post WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [literal(`(SELECT COUNT('*') FROM follow WHERE "followingId" = "User"."id")::int`), 'followersCount'],
                    [literal(`(SELECT COUNT('*') FROM follow WHERE "followerId" = "User"."id")::int`), 'followingsCount']
                ]
            };
        });

        User.addScope('usersForAdmin', () => {
            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    'status',
                    [literal(`(SELECT COUNT('*') FROM post WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [literal(`(SELECT COUNT('*') FROM follow WHERE "followingId" = "User"."id")::int`), 'followersCount'],
                    [literal(`(SELECT COUNT('*') FROM follow WHERE "followerId" = "User"."id")::int`), 'followingsCount']
                ]
            };
        });
    }

    toJSON() {
        const user = this.get();

        const hiddenFields = ['password'];

        return _.omit(user, hiddenFields);
    }
}

module.exports = User;
