const { DataTypes, Model } = require('sequelize');
const _ = require('lodash');
const { FollowStatus } = require('../lcp');

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
        status: {
          type: DataTypes.ENUM,
          values: _.values(FollowStatus),
          defaultValue: FollowStatus.APPROVED,
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
    Follow.belongsTo(models.User, { as: 'follower', foreignKey: 'followerId' });

    Follow.belongsTo(models.User, {
      as: 'following',
      foreignKey: 'followingId',
    });
  }
}

module.exports = Follow;
