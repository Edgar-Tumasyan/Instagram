const { DataTypes, Model } = require('sequelize');

class Like extends Model {
    static init(sequelize) {
        return super.init(
            { id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false } },
            { sequelize, timestamps: true, tableName: 'like' }
        );
    }

    static associate(models) {
        Like.belongsTo(models.Post, { as: 'post', foreignKey: 'postId' });

        Like.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    }
}

module.exports = Like;
