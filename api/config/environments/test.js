const config = {};

// Postgres
config.postgresHost = process.env.POSTGRES_TESTS_SERVICE_HOST;
config.postgresPort = process.env.POSTGRES_TESTS_SERVICE_PORT;
config.postgresDbName = process.env.POSTGRES_TESTS_DB_NAME;
config.postgresUser = process.env.POSTGRES_TESTS_USER;
config.postgresPass = process.env.POSTGRES_TESTS_PASSWORD;

// EOS
config.eosHost = process.env.EOS_TESTS_SERVICE_HOST;
config.eosPort = process.env.EOS_TESTS_SERVICE_PORT;
config.eosUsername = process.env.EOS_TESTS_USERNAME;
config.eosUserPrivKey = process.env.EOS_TESTS_USER_PRIVATE_KEY;
config.eosUserPubKey = process.env.EOS_TESTS_USER_PUBLIC_KEY;

module.exports = config;
