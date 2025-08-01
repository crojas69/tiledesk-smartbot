module.exports = {
  secret: 'nodeauthsecret',
  schemaVersion: 2111,
  database: process.env.MONGODB_URI || 'mongodb://mongodb:27017/tiledesk',
  databaselogs: process.env.MONGODB_LOG_URI || 'mongodb://mongodb:27017/tiledesk-logs',
  databasetest: process.env.MONGODB_TEST_URI || 'mongodb://mongodb:27017/tiledesk-test'
};
