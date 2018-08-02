const config = require('./config');

module.exports = {
  username: config.postgresTestsUser,
  password: config.postgresTestsPass,
  database: config.postgresTestsDbName,
  host: config.postgresTestsHost,
  dialect: 'postgres',
  options: {
    operatorsAliases: false
  }
};
