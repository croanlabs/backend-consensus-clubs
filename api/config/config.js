const config = { };

config.sessionSecret = process.env.SESSION_SECRET;

// Twitter
config.twitterCallbackUrl = process.env.TWITTER_CALLBACK_URL;
config.twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
config.twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;

// Postgres
config.postgresHost = process.env.POSTGRES_MASTER_SERVICE_HOST;
config.postgresPort = process.env.POSTGRES_MASTER_SERVICE_PORT;
config.postgresDbName = process.env.POSTGRES_DB_NAME;
config.postgresUser = process.env.POSTGRES_USER;
config.postgresPass = process.env.POSTGRES_PASSWORD;

// Postgres tests
config.postgresTestsHost = process.env.POSTGRES_TESTS_SERVICE_HOST;
config.postgresTestsPort = process.env.POSTGRES_TESTS_SERVICE_PORT;
config.postgresTestsDbName = process.env.POSTGRES_TESTS_DB_NAME;
config.postgresTestsUser = process.env.POSTGRES_TESTS_USER;
config.postgresTestsPass = process.env.POSTGRES_TESTS_PASSWORD;

// EOS
config.eosHost = process.env.EOS_MASTER_SERVICE_HOST;
config.eosPort = process.env.EOS_MASTER_SERVICE_PORT;
config.eosChainId = process.env.EOS_CHAIN_ID;
config.eosEosioPrivKey = process.env.EOS_EOSIO_PRIVATE_KEY;
config.eosEosioPubKey = process.env.EOS_EOSIO_PUBLIC_KEY;
config.eosUsername = process.env.EOS_USERNAME;
config.eosUserPrivKey = process.env.EOS_USER_PRIVATE_KEY;
config.eosUserPubKey = process.env.EOS_USER_PUBLIC_KEY;

// EOS tests
config.eosTestsHost = process.env.EOS_TESTS_SERVICE_HOST;
config.eosTestsPort = process.env.EOS_TESTS_SERVICE_PORT;
config.eosTestsUsername = process.env.EOS_TESTS_USERNAME;
config.eosTestsUserPrivKey = process.env.EOS_TESTS_USER_PRIVATE_KEY;
config.eosTestsUserPubKey = process.env.EOS_TESTS_USER_PUBLIC_KEY;

module.exports = config;
