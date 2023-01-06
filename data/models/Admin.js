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
                avatar: { type: DataTypes.STRING },
                avatarPublicId: { type: DataTypes.STRING },
                passwordToken: { type: DataTypes.STRING }
            },
            {
                sequelize,
                timestamps: true,
                tableName: 'admin',
                hooks: {
                    beforeSave: async admin => {
                        if (admin.changed('password')) {
                            admin.password = await bcrypt.hash(admin.password, 10);
                        }
                    }
                }
            }
        );
    }

    static addScopes() {
        Admin.addScope('profiles', () => {
            return { attributes: ['id', 'firstname', 'lastname', 'email', 'avatar'] };
        });
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
