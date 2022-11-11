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
        description: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        image: {
          type: DataTypes.STRING,
        },
        userId: {
          type: DataTypes.UUID,
          references: {
            model: 'users',
            key: 'id',
          },
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
  }
}

module.exports = Post;
