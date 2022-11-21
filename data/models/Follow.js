const { DataTypes, Model, literal } = require('sequelize');

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
    Follow.belongsTo(models.User, { as: 'follower', foreignKey: 'followerId' });

    Follow.belongsTo(models.User, { as: 'following', foreignKey: 'followingId' });
  }

  static addScopes(models) {
    Follow.addScope('userFollowers', (followingId) => {
      return {
        attributes: ['id', 'followerId'],
        include: [
          {
            attributes: ['firstname', 'lastname'],
            model: models.User,
            as: 'follower',
          },
        ],
        where: { followingId },
      };
    });

    Follow.addScope('userFollowings', (followerId) => {
      return {
        attributes: [
          'id',
          'followingId',
          [
            literal(
              `(SELECT firstname FROM users WHERE "id" = "Follow"."followingId")`
            ),
            'firstname',
          ],
          [
            literal(
              `(SELECT lastname FROM users WHERE "id" = "Follow"."followingId")`
            ),
            'lastname',
          ],
        ],
        where: { followerId },
      };
    });
  }
}

module.exports = Follow;
