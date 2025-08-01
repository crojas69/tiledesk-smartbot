var dotenvPath = undefined;
process.env.AMQP_URL = process.env.AMQP_URL || 'amqp://rabbitmq:5672';
process.env.REDIS_URL || 'redis://redis:6379'
process.env.MONGODB_URI || 'mongodb://mongodb:27017/tiledesk'
process.env.AMQP_URL || 'amqp://rabbitmq:5672'

if (process.env.DOTENV_PATH) {
  dotenvPath = process.env.DOTENV_PATH;
  console.log("load dotenv from DOTENV_PATH", dotenvPath);
}

if (process.env.LOAD_DOTENV_SUBFOLDER) {
  console.log("load dotenv from LOAD_DOTENV_SUBFOLDER");
  dotenvPath = __dirname + '/confenv/.env';
}

require('dotenv').config({ path: dotenvPath });

var mongoose = require('mongoose');
let winston = require('./config/winston');
let JobsManager = require('./jobsManager');

let geoService = require('./services/geoService');
var subscriptionNotifierQueued = require('./services/subscriptionNotifierQueued');
var botSubscriptionNotifier = require('./services/BotSubscriptionNotifier');

const botEvent = require('./event/botEvent');
var channelManager = require('./channels/channelManager');
var updateLeadQueued = require('./services/updateLeadQueued');

require('./services/mongoose-cache-fn')(mongoose);
var config = require('./config/database');

// 💡 Establecer AMQP_URL explícitamente si no está definido
if (!process.env.AMQP_URL) {
  process.env.AMQP_URL = 'amqp://rabbitmq:5672';
  console.log("AMQP_URL no estaba definido. Usando valor por defecto:", process.env.AMQP_URL);
}

// Desactivar worker
// process.env.JOB_WORKER_ENABLED = false; // Commented out to allow docker-compose.yml to set this variable

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI || config.database;
var autoIndex = true;

if (!databaseUri) {
  winston.warn('DATABASE_URI not specified, falling back to localhost.');
}

mongoose.connect(databaseUri, { useNewUrlParser: true, autoIndex: autoIndex }, function (err) {
  if (err) {
    winston.error('Failed to connect to MongoDB on ' + databaseUri, err);
    process.exit(1);
  }
  winston.info("Mongoose connection done on host: " + mongoose.connection.host + " on port: " + mongoose.connection.port + " with name: " + mongoose.connection.name);
});

async function main() {
  require('./pubmodules/cache').cachegoose(mongoose);
  require('./pubmodules/rules/appRules').start();
  require('./pubmodules/queue');
  channelManager.listen();

  let jobsManager = new JobsManager(undefined, geoService, botEvent, subscriptionNotifierQueued, botSubscriptionNotifier, updateLeadQueued);
  jobsManager.listen();

  let emailNotification = require('./pubmodules/emailNotification');
  jobsManager.listenEmailNotification(emailNotification);

  let activityArchiver = require('./pubmodules/activities').activityArchiver;
  jobsManager.listenActivityArchiver(activityArchiver);

  let routingQueueQueued = require('./pubmodules/routing-queue').listenerQueued;
  winston.debug("routingQueueQueued");
  jobsManager.listenRoutingQueue(routingQueueQueued);

  let whatsappQueue = require('@tiledesk/tiledesk-whatsapp-jobworker');
  winston.info("whatsappQueue");
  jobsManager.listenWhatsappQueue(whatsappQueue);

  let scheduler = require('./pubmodules/scheduler');
  jobsManager.listenScheduler(scheduler);

  let multiWorkerQueue = require('@tiledesk/tiledesk-multi-worker');
  jobsManager.listenMultiWorker(multiWorkerQueue);

  winston.info("Jobs started");

  await new Promise(() => {}); // mantener proceso vivo
  console.log('This text will never be printed');
}

function panic(error) {
  console.error(error);
  process.exit(1);
}

main().catch(panic).finally(clearInterval.bind(null, setInterval(a => a, 1E9)));
