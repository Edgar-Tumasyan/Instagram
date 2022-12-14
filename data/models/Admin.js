const { DataTypes, Model } = require('sequelize');
const _ = require('lodash');

class Admin extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: {
                    type: DataTypes.UUID,
                    defaultValue: DataTypes.UUIDV4,
                    primaryKey: true,
                    allowNull: false
                },
                firstname: { type: DataTypes.STRING, allowNull: false },
                lastname: { type: DataTypes.STRING, allowNull: false },
                email: {
                    type: DataTypes.STRING,
                    allowNull: false,
                    unique: true,
                    validate: { isEmail: true }
                },
                password: { type: DataTypes.STRING, allowNull: false },
                avatar: DataTypes.STRING,
                avatarPublicId: DataTypes.STRING
            },
            {
                sequelize,
                timestamps: true,
                tableName: 'admin'
            }
        );
    }

    static addScopes(models) {}

    toJSON() {
        const admin = this.get();

        const hiddenFields = ['password'];

        return _.omit(admin, hiddenFields);
    }
}

module.exports = Admin;
