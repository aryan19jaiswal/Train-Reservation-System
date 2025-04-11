
// Configuration settings for the application
module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'theynotlikeusbyKendrickLamar',
  JWT_EXPIRY: '24h',
  SALT_ROUNDS: 10 // For bcrypt password hashing
};
