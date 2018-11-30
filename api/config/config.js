// eslint-disable-next-line import/no-dynamic-require
const envSpecific = require(`./environments/${process.env.NODE_ENV ||
  'development'}`);
const config = {};

config.sessionSecret = process.env.SESSION_SECRET;

// General app info
config.siteUrl = process.env.SITE_URL;

// Authentication
config.authTokenSecret = process.env.AUTH_TOKEN_SECRET;

// Twitter
config.twitterCallbackUrl = process.env.TWITTER_CALLBACK_URL;
config.twitterConsumerKey = process.env.TWITTER_CONSUMER_KEY;
config.twitterConsumerSecret = process.env.TWITTER_CONSUMER_SECRET;
config.twitterAccessToken = process.env.TWITTER_ACCESS_TOKEN;
config.twitterAccessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

// Postgres
config.postgresHost = process.env.POSTGRES_MASTER_SERVICE_HOST;
config.postgresPort = process.env.POSTGRES_MASTER_SERVICE_PORT;
config.postgresDbName = process.env.POSTGRES_DB_NAME;
config.postgresUser = process.env.POSTGRES_USER;
config.postgresPass = process.env.POSTGRES_PASSWORD;

// Stripe
config.stripeKey = process.env.STRIPE_KEY;

// Override or add env specific variables
const confKeys = Object.keys(envSpecific);
confKeys.forEach(key => {
  config[key] = envSpecific[key];
});

module.exports = config;
