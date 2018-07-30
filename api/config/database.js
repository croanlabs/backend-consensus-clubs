const Sequelize = require('sequelize');
const config = require('./config');

const sequelize = new Sequelize(config.postgresDbName, config.postgresUser,
  config.postgresPass, {
    host: config.postgresHost,
    port: config.postgresPort,
    dialect: 'postgres',
    operatorsAliases: false,
  });

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
