const envSpecific = require(`./environments/${process.env.NODE_ENV || 'development'}`);
const config = {};

config.sessionSecret = process.env.SESSION_SECRET;

// Authentication
config.authTokenSecret = process.env.AUTH_TOKEN_SECRET;

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

// EOS
config.eosHost = process.env.EOS_MASTER_SERVICE_HOST;
config.eosPort = process.env.EOS_MASTER_SERVICE_PORT;
config.eosChainId = process.env.EOS_CHAIN_ID;
config.eosEosioPrivKey = process.env.EOS_EOSIO_PRIVATE_KEY;
config.eosEosioPubKey = process.env.EOS_EOSIO_PUBLIC_KEY;
config.eosUsername = process.env.EOS_USERNAME;
config.eosUserPrivKey = process.env.EOS_USER_PRIVATE_KEY;
config.eosUserPubKey = process.env.EOS_USER_PUBLIC_KEY;

// Override or add env specific variables
// FIXME move merge function to helpers and just call it here.
for (let key in envSpecific) {
  config[key] = envSpecific[key];
}

module.exports = config;
