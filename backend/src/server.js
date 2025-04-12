const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
const { createServer } = require('http');

const routes = require('./routes');
const config = require('../config');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');
const blockchainClient = require('./blockchain/client');

const app = express();

app.use(helmet());
app.use(compression());
app.use(cors({
  origin: config.corsOrigin,
  methods: config.corsMethods,
  optionsSuccessStatus: 200
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.rateLimitMax,
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

const morganFormat = config.isDevelopment ? 'dev' : 'combined';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use('/uploads', express.static(path.join(__dirname, '..', config.uploadDir)));

app.use('/api', routes);

app.use(errorHandler);

const server = createServer(app);

mongoose.connect(config.mongoUri)
  .then(() => {
    logger.info('MongoDB connected successfully');
    
    return blockchainClient.initialize();
  })
  .then((blockchainSuccess) => {
    if (blockchainSuccess) {
      logger.info('Blockchain connection initialized successfully');
    } else {
      logger.warn('Blockchain initialization failed or was disabled. Some features may be limited.');
    }
    
    const PORT = config.port || 5000;
    server.listen(PORT, () => {
      logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Error starting server:', err);
    process.exit(1);
  });

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = server; 