const { DataTypes, Model } = require('sequelize');

class Message extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                text: { type: DataTypes.TEXT, allowNull: false }
            },
            { sequelize, timestamps: true, tableName: 'message' }
        );
    }

    static associate(models) {
        Message.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });

        Message.belongsTo(models.Thread, { as: 'thread', foreignKey: 'threadId' });
    }
}

module.exports = Message;
