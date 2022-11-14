const { DataTypes, Model } = require('sequelize');

class Follow extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        followerId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        followingId: {
          type: DataTypes.UUID,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        tableName: 'follows',
      }
    );
  }
  static associate(models) {
    Follow.belongsTo(models.User, { as: 'user', foreignKey: 'followerId' });

    Follow.belongsTo(models.User, { as: 'users', foreignKey: 'followingId' });
  }
}

module.exports = Follow;
