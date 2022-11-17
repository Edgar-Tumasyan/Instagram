const { DataTypes, Model, literal } = require('sequelize');
const { values: _values } = require('lodash');
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
          values: _values(UserRole),
          defaultValue: UserRole.USER,
        },
        avatar: DataTypes.STRING,
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
      onDelete: 'Cascade',
    });

    User.hasMany(models.Follow, {
      as: 'followers',
      foreignKey: 'followingId',
      onDelete: 'Cascade',
    });

    User.hasMany(models.Attachment, {
      as: 'attachments',
      foreignKey: 'userId',
      onDelete: 'Cascade',
    });
  }

  static addScopes() {
    User.addScope('profile', () => {
      return {
        attributes: [
          'id',
          'firstname',
          'lastname',
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
        ],
      };
    });
  }
}

module.exports = User;
