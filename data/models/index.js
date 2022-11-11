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

    models[model].generateNestedQuery = query => {
        return literal(
            `(${sequelize
                .getQueryInterface()
                .queryGenerator.selectQuery(models[model].getTableName(), query)
                .slice(0, -1)})`
        );
    };
}

models.sequelize = sequelize;
models.Sequelize = Sequelize;

module.exports = models;
