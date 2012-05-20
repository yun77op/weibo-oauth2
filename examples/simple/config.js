var config = require('./config.json')
  , env = process.env.NODE_ENV || 'development';


var envConfig = config.environment[env], i;

for (i in envConfig) {
  config[i] = envConfig[i];
}

module.exports = config;