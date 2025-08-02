/**
 * MongoDB connection options configuration
 * This file contains different connection options for various environments
 */

const winston = require('./winston');

// Default connection options for local MongoDB instances
const defaultOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  autoIndex: true
};

// Connection options for MongoDB Atlas (with SSL/TLS)
const atlasOptions = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  autoIndex: true,
  ssl: process.env.MONGODB_SSL === 'false' ? false : true,
  sslValidate: process.env.MONGODB_SSL_VALIDATE === 'true' ? true : false, // Skip SSL validation for compatibility by default
  tlsAllowInvalidCertificates: process.env.MONGODB_TLS_ALLOW_INVALID_CERTIFICATES === 'false' ? false : true, // Allow invalid certificates for compatibility by default
  tlsAllowInvalidHostnames: process.env.MONGODB_TLS_ALLOW_INVALID_HOSTNAMES === 'false' ? false : true // Allow invalid hostnames for compatibility by default
};

// Function to determine which options to use based on the connection URI
function getConnectionOptions(uri) {
  // Check if connecting to MongoDB Atlas
  if (uri && uri.startsWith('mongodb+srv://')) {
    winston.info('Using MongoDB Atlas connection options with SSL/TLS');
    return { ...atlasOptions };
  }
  
  // Default to local MongoDB options
  winston.info('Using default MongoDB connection options');
  return { ...defaultOptions };
}

module.exports = {
  getConnectionOptions
};
