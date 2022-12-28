const fs = require('fs');
const pg = require('pg');
const _ = require('lodash');
const path = require('path');
const { Sequelize, Op, literal, where, fn, col } = require('sequelize');

const config = require('../../config');

delete pg.native;
const basename = path.basename(__filename);
const sequelize = new Sequelize(config.db);

const models = Object.assign(
    {},
    ...fs
        .readdirSync(__dirname)
        .filter(file => file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js')
        .map(file => {
            const model = require(path.join(__dirname, file));
            return { [model.name]: model.init(sequelize) };
        })
);

for (const model of Object.keys(models)) {
    _.isFunction(models[model].associate) && models[model].associate(models, sequelize);
    _.isFunction(models[model].addScopes) && models[model].addScopes(models, sequelize);

    models[model].generateNestedQuery = query => {
        return literal(
            `(${sequelize.getQueryInterface().queryGenerator.selectQuery(models[model].getTableName(), query).slice(0, -1)})`
        );
    };
}

models.generateSearchQuery = (string, fields = ['firstName', 'lastName']) => {
    const permArr = [];
    const newArray = [];
    const usedChars = [];

    const strings = _.take(_.words(string, /[^, ]+/g), 3);

    for (let i = 0; i < fields.length; i++) {
        newArray.push(col(fields[i]));

        if (fields.length !== i + 1) {
            newArray.push(' ');
        }
    }

    const columns = fn('concat', ...newArray);

    function generateQueryString(input) {
        for (let i = 0; i < input.length; i++) {
            const ch = input.splice(i, 1)[0];
            usedChars.push(ch);

            if (!input.length) {
                permArr.push(where(columns, { [Op.iLike]: `%${usedChars.slice().join('%')}%` }));
            }

            generateQueryString(input);
            input.splice(i, 0, ch);
            usedChars.pop();
        }

        return permArr;
    }

    return { [Op.or]: generateQueryString(strings) };
};

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
