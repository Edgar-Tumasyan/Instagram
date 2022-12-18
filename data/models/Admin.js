const _ = require('lodash');
const { DataTypes, Model } = require('sequelize');

class Admin extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                firstname: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
                lastname: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
                email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
                password: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [6, 14] } } },
                avatar: DataTypes.STRING,
                avatarPublicId: DataTypes.STRING
            },
            { sequelize, timestamps: true, tableName: 'admin' }
        );
    }

    toJSON() {
        const admin = this.get();

        const hiddenFields = ['password'];

        return _.omit(admin, hiddenFields);
    }
}

module.exports = Admin;
