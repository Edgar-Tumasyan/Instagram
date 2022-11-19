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
        likesCount: {
          type: DataTypes.INTEGER,
          defaultValue: 0,
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
      onDelete: 'CASCADE',
    });

    Post.hasMany(models.Attachment, {
      as: 'attachments',
      foreignKey: 'postId',
      onDelete: 'Cascade',
    });

    Post.hasMany(models.Like, {
      as: 'likes',
      foreignKey: 'postId',
      onDelete: 'Cascade',
    });
  }

  static addScopes(models) {
    Post.addScope('expand', () => {
      return {
        attributes: [
          'id',
          'title',
          'description',
          'likesCount',
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

    Post.addScope('userAllPosts', (userId) => {
      return {
        attributes: ['id', 'title', 'description', 'likesCount'],
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
        where: { userId },
      };
    });
  }
}

module.exports = Post;
