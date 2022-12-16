const { DataTypes, Model } = require('sequelize');

class ThreadUser extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false
                },
                threadId: { type: DataTypes.UUID, allowNull: false },
                userId: { type: DataTypes.UUID, allowNull: false }
            },
            {
                sequelize,
                timestamps: true,
                tableName: 'threadUser'
            }
        );
    }

    static associate(models) {
        ThreadUser.belongsTo(models.Thread, { as: 'thread', foreignKey: 'threadId' });

        ThreadUser.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    }
}

module.exports = ThreadUser;
