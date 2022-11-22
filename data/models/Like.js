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
    });

    Like.belongsTo(models.User, {
      as: 'user',
      foreignKey: 'userId',
    });
  }

  static addScopes(models) {
    Like.addScope('likesUsers', (postId) => {
      return {
        attributes: ['userId'],
        include: [
          {
            attributes: ['firstname', 'lastname', 'avatar'],
            model: models.User,
            as: 'user',
          },
        ],
        where: { postId },
      };
    });
  }
}

module.exports = Like;
