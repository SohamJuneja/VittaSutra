const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const config = require('./src/config');
const logger = require('./src/utils/logger');


const authRoutes = require('./src/routes/authRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const expenditureRoutes = require('./src/routes/expenditureRoutes');
const complaintRoutes = require('./src/routes/complaintRoutes');
const blockchainRoutes = require('./src/routes/blockchainRoutes');


const app = express();


mongoose
  .connect(config.database.uri, config.database.options)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('MongoDB connection error:', err);
    process.exit(1);
  });


app.use(helmet());


app.use(cors(config.cors));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));


app.use(xss());


const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);


if (config.server.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}


app.use('/uploads', express.static(path.join(__dirname, config.storage.uploadDir)));


app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/blockchain', blockchainRoutes);


app.get('/api/status', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    environment: config.server.env,
    timestamp: new Date().toISOString()
  });
});


if (config.server.env === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}


app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  logger.error('Unhandled error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  res.status(statusCode).json({
    status: 'error',
    message,
    ...(config.server.env === 'development' && { stack: err.stack })
  });
});


const PORT = config.server.port;
const server = app.listen(PORT, () => {
  logger.info(`Server running in ${config.server.env} mode on port ${PORT}`);
});


process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION:', err);
 
  server.close(() => {
    process.exit(1);
  });
});


process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION:', err);

  server.close(() => {
    process.exit(1);
  });
});

module.exports = app; 