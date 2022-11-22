const { DataTypes, Model, literal, Op } = require('sequelize');
const _ = require('lodash');
const { UserRole } = require('../lcp');

class User extends Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        firstname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        lastname: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
          validate: {
            isEmail: true,
          },
        },
        password: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        role: {
          type: DataTypes.ENUM,
          values: _.values(UserRole),
          defaultValue: UserRole.USER,
        },
        avatar: DataTypes.STRING,
        avatarPublicId: DataTypes.STRING,
      },
      {
        sequelize,
        timestamps: true,
        tableName: 'users',
      }
    );
  }

  static associate(models) {
    User.hasMany(models.Post, {
      as: 'posts',
      foreignKey: 'userId',
    });

    User.hasMany(models.Follow, {
      as: 'followers',
      foreignKey: 'followerId',
    });

    User.hasMany(models.Follow, {
      as: 'followings',
      foreignKey: 'followingId',
    });

    User.hasMany(models.Attachment, {
      as: 'attachments',
      foreignKey: 'userId',
    });
  }

  static addScopes(models) {
    User.addScope('profile', () => {
      return {
        attributes: [
          'id',
          'firstname',
          'lastname',
          'avatar',
          [
            literal(
              `(SELECT count('*') FROM posts WHERE "userId" = "User"."id")::int`
            ),
            'postsCount',
          ],
          [
            literal(
              `(SELECT count('*') FROM follows WHERE "followingId" = "User"."id")::int`
            ),
            'followersCount',
          ],
          [
            literal(
              `(SELECT count('*') FROM follows WHERE "followerId" = "User"."id")::int`
            ),
            'followingsCount',
          ],
        ],
      };
    });

    User.addScope('followers', (followingId) => {
      return {
        attributes: ['id', 'firstname', 'lastname', 'avatar'],
        where: {
          id: {
            [Op.in]: models.Follow.generateNestedQuery({
              attributes: ['followerId'],
              where: { followingId },
            }),
          },
        },
      };
    });

    User.addScope('followings', (followerId) => {
      return {
        attributes: ['id', 'firstname', 'lastname', 'avatar'],
        where: {
          id: {
            [Op.in]: models.Follow.generateNestedQuery({
              attributes: ['followingId'],
              where: { followerId },
            }),
          },
        },
      };
    });

    User.addScope('likesUsers', (postId) => {
      return {
        attributes: ['id', 'firstname', 'lastname', 'avatar'],
        where: {
          id: {
            [Op.in]: models.Like.generateNestedQuery({
              attributes: ['userId'],
              where: { postId },
            }),
          },
        },
      };
    });
  }

  toJSON() {
    const data = this.get();

    return _.omit(data, 'password', 'role', 'createdAt', 'updatedAt');
  }
}

module.exports = User;
