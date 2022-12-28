const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { DataTypes, Model } = require('sequelize');

const config = require('../../config');

class Admin extends Model {
    static init(sequelize) {
        return super.init(
            {
                id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, allowNull: false },
                firstname: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
                lastname: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [3, 12] } } },
                email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
                password: { type: DataTypes.STRING, allowNull: false, validate: { len: { args: [6, 65] } } },
                avatar: DataTypes.STRING,
                avatarPublicId: DataTypes.STRING,
                passwordToken: DataTypes.STRING
            },
            {
                sequelize,
                timestamps: true,
                tableName: 'admin',
                hooks: {
                    beforeCreate: async admin => {
                        admin.password = await bcrypt.hash(admin.password, 10);
                    }
                }
            }
        );
    }

    generateToken(role) {
        const { id, email } = this;

        return jwt.sign({ id, email, role }, config.JWT_SECRET, { expiresIn: config.EXPIRES_IN });
    }

    async comparePassword(password, adminPassword) {
        return await bcrypt.compare(password, adminPassword);
    }

    toJSON() {
        const admin = this.get();

        const hiddenFields = ['password', 'passwordToken'];

        return _.omit(admin, hiddenFields);
    }
}

module.exports = Admin;
