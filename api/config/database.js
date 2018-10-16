const Sequelize = require('sequelize');
const config = require('./config');
const models = require('../models');

const sequelize = new Sequelize(
  config.postgresDbName,
  config.postgresUser,
  config.postgresPass,
  {
    host: config.postgresHost,
    port: config.postgresPort,
    dialect: 'postgres',
    operatorsAliases: false,
    define: {
      timestamps: true,
    },
    logging: false,
  },
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Load and get all the models and their associations
const db = models.setAndGet(sequelize);
db.sequelize = sequelize;

module.exports = db;
