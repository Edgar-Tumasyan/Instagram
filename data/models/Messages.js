const { DataTypes, Model, literal } = require('sequelize');

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

    static addScopes() {
        Message.addScope('lastMessage', messageId => {
            return { where: { createdAt: [literal(`(SELECT MAX("createdAt") from message where id != '${messageId}')`)] } };
        });
    }
}

module.exports = Message;
