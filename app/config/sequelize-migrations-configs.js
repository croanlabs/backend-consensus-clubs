module.exports = {
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASS,
  database: process.env.POSTGRES_DB_NAME,
  host: process.env.POSTGRES_MASTER_SERVICE_HOST,
  dialect: 'postgres',
  options: {
    operatorsAliases: false
  }
};
