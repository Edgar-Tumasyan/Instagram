const { DataTypes, Model, literal, Op } = require('sequelize');

class Post extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                title: { type: DataTypes.STRING, allowNull: false },
                description: { type: DataTypes.STRING, allowNull: false }
            },
            { sequelize, timestamps: true, tableName: 'post' }
        );
    }

    static associate(models) {
        Post.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });

        Post.hasMany(models.Attachment, { as: 'attachments', foreignKey: 'postId' });

        Post.hasMany(models.Like, { as: 'likes', foreignKey: 'postId' });
    }

    static addScopes(models) {
        Post.addScope('allPosts', () => {
            return {
                attributes: [
                    'id',
                    'title',
                    'description',
                    [literal(`(SELECT COUNT('*') FROM "like" WHERE "postId" = "Post"."id")::int`), 'likesCount'],
                    [literal(`(SELECT COUNT('*') FROM "attachment" WHERE "postId" = "Post"."id")::int`), 'attachmentsCount']
                ],
                include: [
                    {
                        attributes: ['id', 'firstname', 'lastname'],
                        model: models.User,
                        as: 'user',
                        where: {
                            profileCategory: 'public'
                        }
                    },
                    {
                        attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
                        model: models.Attachment,
                        as: 'attachments',
                        separate: true
                    }
                ]
            };
        });

        Post.addScope('expand', () => {
            return {
                attributes: [
                    'id',
                    'title',
                    'description',
                    [literal(`(SELECT COUNT('*') FROM "like" WHERE "postId" = "Post"."id")::int`), 'likesCount'],
                    [literal(`(SELECT COUNT('*') FROM "attachment" WHERE "postId" = "Post"."id")::int`), 'attachmentsCount']
                ],
                include: [
                    { attributes: ['id', 'firstname', 'lastname'], model: models.User, as: 'user' },
                    {
                        attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
                        model: models.Attachment,
                        as: 'attachments',
                        separate: true
                    }
                ]
            };
        });

        Post.addScope('singlePost', followerId => {
            return {
                attributes: [
                    'id',
                    'title',
                    'description',
                    [literal(`(SELECT COUNT('*') FROM "like" WHERE "postId" = "Post"."id")::int`), 'likesCount'],
                    [literal(`(SELECT COUNT('*') FROM attachment WHERE "postId" = "Post"."id")::int`), 'attachmentsCount']
                ],
                include: [
                    {
                        attributes: [
                            'id',
                            'firstname',
                            'lastname',
                            'profileCategory',
                            [
                                literal(
                                    `(SELECT CASE (SELECT COALESCE((SELECT status FROM follow WHERE "followerId" =
                                    '${followerId}' AND "followingId" = "Post"."userId"), NULL ))
                                   WHEN 'pending' THEN 'pending'
                                   WHEN 'approved' THEN 'approved'
                                   ELSE 'unfollow'
                                   END as status)`
                                ),
                                'followStatus'
                            ]
                        ],
                        model: models.User,
                        as: 'user'
                    },
                    {
                        attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
                        model: models.Attachment,
                        as: 'attachments',
                        separate: true
                    }
                ]
            };
        });

        Post.addScope('userAllPosts', profileId => {
            return {
                attributes: [
                    'id',
                    'title',
                    'description',
                    [literal(`(SELECT COUNT('*') FROM "like" WHERE "postId" = "Post"."id")::int`), 'likesCount'],
                    [literal(`(SELECT COUNT('*') FROM attachment WHERE "postId" = "Post"."id")::int`), 'attachmentsCount']
                ],
                include: [
                    { attributes: ['id', 'firstname', 'lastname'], model: models.User, as: 'user' },
                    { attributes: ['id', 'attachmentUrl'], model: models.Attachment, as: 'attachments', separate: true }
                ],
                where: { userId: profileId }
            };
        });

        Post.addScope('mainPosts', userId => {
            const followedUsers = [
                literal(`(SELECT id FROM "user" WHERE id in (Select "followingId" from follow where
                        "followerId" = '${userId}'))`)
            ];

            return {
                attributes: [
                    'id',
                    'title',
                    'description',
                    [literal(`(SELECT COUNT('*') FROM "like" WHERE "postId" = "Post"."id")::int`), 'likesCount'],
                    [literal(`(SELECT COUNT('*') FROM attachment WHERE "postId" = "Post"."id")::int`), 'attachmentsCount']
                ],
                include: [
                    { attributes: ['id', 'firstname', 'lastname'], model: models.User, as: 'user' },
                    {
                        attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
                        model: models.Attachment,
                        as: 'attachments',
                        separate: true
                    }
                ],
                where: { userId: { [Op.in]: followedUsers } }
            };
        });

        Post.addScope('postsForAdmin', () => {
            return {
                attributes: [
                    'id',
                    'title',
                    'description',
                    [literal(`(SELECT COUNT('*') FROM "like" WHERE "postId" = "Post"."id")::int`), 'likesCount'],
                    [literal(`(SELECT COUNT('*') FROM attachment WHERE "postId" = "Post"."id")::int`), 'attachmentsCount']
                ],
                include: [
                    { attributes: ['id', 'firstname', 'lastname'], model: models.User, as: 'user' },
                    {
                        attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
                        model: models.Attachment,
                        as: 'attachments',
                        separate: true
                    }
                ]
            };
        });
    }
}

module.exports = Post;
