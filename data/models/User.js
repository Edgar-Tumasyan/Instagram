const { DataTypes, Model } = require('sequelize');

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
          values: ['admin', 'user'],
          defaultValue: 'user',
          allowNull: false,
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
    User.hasMany(models.Post, { as: 'posts', foreignKey: 'userId' });
    User.hasMany(models.Attachment, {as: 'attachments', foreignKey: 'userId'})
    User.hasMany(models.Follow, {as: 'followers', foreignKey: 'followingId'})
  }
}

module.exports = User;
