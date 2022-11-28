const { DataTypes, Model, literal, Op } = require('sequelize');
const _ = require('lodash');
const { UserRole, ProfileCategory } = require('../lcp');

class User extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false
                },
                firstname: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                lastname: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                    validate: {
                        isEmail: true
                    }
                },
                password: {
                    type: DataTypes.STRING,
                    allowNull: false
                },
                role: {
                    type: DataTypes.ENUM,
                    values: _.values(UserRole),
                    defaultValue: UserRole.USER
                },
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
                tableName: 'users'
            }
        );
    }

    static associate(models) {
        User.hasMany(models.Post, {
            as: 'posts',
            foreignKey: 'userId'
        });

        User.hasMany(models.Follow, {
            as: 'followers',
            foreignKey: 'followerId'
        });

        User.hasMany(models.Follow, {
            as: 'followings',
            foreignKey: 'followingId'
        });

        User.hasMany(models.Attachment, {
            as: 'attachments',
            foreignKey: 'userId'
        });
    }

    static addScopes(models) {
        User.addScope('profile', (profileId, userId) => {
            return {
                attributes: [
                    'id',
                    'firstname',
                    'lastname',
                    'avatar',
                    [literal(`(SELECT count('*') FROM posts WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [literal(`(SELECT count('*') FROM follows WHERE "followingId" = "User"."id")::int`), 'followersCount'],
                    [literal(`(SELECT count('*') FROM follows WHERE "followerId" = "User"."id")::int`), 'followingsCount'],
                    [
                        literal(
                            `(Select CASE (Select COALESCE((Select status from follows WHERE "followerId" =
                        '${userId}' and "followingId" = '${profileId}'), null ))
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
                    [
                        literal(
                            `(Select CASE (Select COALESCE((Select status from follows WHERE "followerId" =
                        '${userId}' and "followingId" = "User"."id"), null ))
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
                    [
                        literal(
                            `(Select CASE (Select COALESCE((Select status from follows WHERE "followerId" =
                        '${userId}' and "followingId" = "User"."id"), null ))
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
                        [Op.in]: models.Follow.generateNestedQuery({
                            attributes: ['followerId'],
                            where: { followingId }
                        })
                    }
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
                    [
                        literal(
                            `(Select CASE (Select COALESCE((Select status from follows WHERE "followerId" =
                        '${userId}' and "followingId" = "User"."id"), null ))
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
                        [Op.in]: models.Follow.generateNestedQuery({
                            attributes: ['followingId'],
                            where: { followerId }
                        })
                    }
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
                    [
                        literal(
                            `(Select CASE (Select COALESCE((Select status from follows WHERE "followerId" =
                        '${userId}' and "followingId" = "User"."id"), null ))
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
                        [Op.in]: models.Like.generateNestedQuery({
                            attributes: ['userId'],
                            where: { postId }
                        })
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
                    [literal(`(SELECT count('*') FROM posts WHERE "userId" = "User"."id")::int`), 'postsCount'],
                    [literal(`(SELECT count('*') FROM follows WHERE "followingId" = "User"."id")::int`), 'followersCount'],
                    [literal(`(SELECT count('*') FROM follows WHERE "followerId" = "User"."id")::int`), 'followingsCount']
                ]
            };
        });
    }
}

module.exports = User;
