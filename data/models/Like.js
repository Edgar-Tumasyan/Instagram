const { DataTypes, Model } = require('sequelize');

class Like extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        postId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        attachmentId: {
          type: DataTypes.UUID,
        },
      },
      {
        sequelize,
        timestamps: true,
        tableName: 'likes',
      }
    );
  }

  static associate(models) {
    Like.belongsTo(models.Post, {
      as: 'post',
      foreignKey: 'postId',
      onDelete: 'CASCADE',
    });

    Like.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
      onDelete: 'CASCADE',
    });

    Like.belongsTo(models.Attachment, {
      as: 'attachemnt',
      foreignKey: 'attachmentId',
      onDelete: 'CASCADE',
    });
  }

  static addScopes(models) {}
}

module.exports = Like;
