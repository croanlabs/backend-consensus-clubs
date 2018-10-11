const config = require('./config');

module.exports = {
  username: config.postgresUser,
  password: config.postgresPass,
  database: config.postgresDbName,
  host: config.postgresHost,
  dialect: 'postgres',
  options: {
    operatorsAliases: false,
  },
};
