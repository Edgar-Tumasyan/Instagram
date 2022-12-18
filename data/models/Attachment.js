const { DataTypes, Model } = require('sequelize');

class Attachment extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                attachmentUrl: { type: DataTypes.STRING, allowNull: false },
                attachmentPublicId: { type: DataTypes.STRING, allowNull: false }
            },
            { sequelize, timestamps: true, tableName: 'attachment' }
        );
    }

    static associate(models) {
        Attachment.belongsTo(models.Post, { as: 'post', foreignKey: 'postId' });

        Attachment.belongsTo(models.User, { as: 'user', foreignKey: 'userId' });
    }
}

module.exports = Attachment;
