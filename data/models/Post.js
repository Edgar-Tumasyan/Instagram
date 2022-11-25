const { DataTypes, Model, literal } = require('sequelize');

class Post extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        title: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        tableName: 'posts',
      }
    );
  }

  static associate(models) {
    Post.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
    });

    Post.hasMany(models.Attachment, {
      as: 'attachments',
      foreignKey: 'postId',
    });

    Post.hasMany(models.Like, {
      as: 'likes',
      foreignKey: 'postId',
    });
  }

  static addScopes(models) {
    Post.addScope('allPosts', () => {
      return {
        attributes: [
          'id',
          'title',
          'description',
          [
            literal(
              `(SELECT count('*') FROM likes WHERE "postId" = "Post"."id")::int`
            ),
            'likesCount',
          ],
          [
            literal(
              `(SELECT count('*') FROM attachments WHERE "postId" = "Post"."id")::int`
            ),
            'attachmentsCount',
          ],
        ],
        include: [
          {
            attributes: ['id', 'firstname', 'lastname'],
            model: models.User,
            as: 'user',
            where: {
              profileCategory: 'public',
            },
          },
          {
            attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
            model: models.Attachment,
            as: 'attachments',
            separate: true,
          },
        ],
      };
    });

    Post.addScope('expand', () => {
      return {
        attributes: [
          'id',
          'title',
          'description',
          [
            literal(
              `(SELECT count('*') FROM likes WHERE "postId" = "Post"."id")::int`
            ),
            'likesCount',
          ],
          [
            literal(
              `(SELECT count('*') FROM attachments WHERE "postId" = "Post"."id")::int`
            ),
            'attachmentsCount',
          ],
        ],
        include: [
          {
            attributes: ['id', 'firstname', 'lastname'],
            model: models.User,
            as: 'user',
          },
          {
            attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
            model: models.Attachment,
            as: 'attachments',
            separate: true,
          },
        ],
      };
    });

    Post.addScope('newPost', () => {
      return {
        attributes: [
          'id',
          'title',
          'description',
          [
            literal(
              `(SELECT count('*') FROM likes WHERE "postId" = "Post"."id")::int`
            ),
            'likesCount',
          ],
          [
            literal(
              `(SELECT count('*') FROM attachments WHERE "postId" = "Post"."id")::int`
            ),
            'attachmentsCount',
          ],
        ],
        include: [
          {
            attributes: ['id', 'firstname', 'lastname'],
            model: models.User,
            as: 'user',
          },
          {
            attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
            model: models.Attachment,
            as: 'attachments',
            separate: true,
          },
        ],
      };
    });

    Post.addScope('singlePost', () => {
      return {
        attributes: [
          'id',
          'title',
          'description',
          [
            literal(
              `(SELECT count('*') FROM likes WHERE "postId" = "Post"."id")::int`
            ),
            'likesCount',
          ],
          [
            literal(
              `(SELECT count('*') FROM attachments WHERE "postId" = "Post"."id")::int`
            ),
            'attachmentsCount',
          ],
        ],
        include: [
          {
            attributes: ['id', 'firstname', 'lastname', 'profileCategory'],
            model: models.User,
            as: 'user',
          },
          {
            attributes: ['id', 'attachmentUrl', 'attachmentPublicId'],
            model: models.Attachment,
            as: 'attachments',
            separate: true,
          },
        ],
      };
    });

    Post.addScope('userAllPosts', (profileId) => {
      return {
        attributes: [
          'id',
          'title',
          'description',
          [
            literal(
              `(SELECT count('*') FROM likes WHERE "postId" = "Post"."id")::int`
            ),
            'likesCount',
          ],
          [
            literal(
              `(SELECT count('*') FROM attachments WHERE "postId" = "Post"."id")::int`
            ),
            'attachmentsCount',
          ],
        ],
        include: [
          {
            attributes: ['id', 'firstname', 'lastname'],
            model: models.User,
            as: 'user',
          },
          {
            attributes: ['id', 'attachmentUrl'],
            model: models.Attachment,
            as: 'attachments',
            separate: true,
          },
        ],
        where: { userId: profileId },
      };
    });
  }
}

module.exports = Post;
