const Twit = require('twit');
const config = require('./config');

const twitterClient = new Twit({
  consumer_key: config.twitterConsumerKey,
  consumer_secret: config.twitterConsumerSecret,
  access_token: config.twitterAccessToken,
  access_token_secret: config.twitterAccessTokenSecret
});

module.exports = twitterClient;
