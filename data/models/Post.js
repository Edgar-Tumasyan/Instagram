const { DataTypes, Model } = require('sequelize');

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
    Post.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });

    Post.hasMany(models.Attachment, {
      as: 'attachments',
      foreignKey: 'postId',
    });
  }
}

module.exports = Post;
