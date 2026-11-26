const { createApp } = require('./app');
const { config } = require('./config/environment');

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🌱 AgriCycle Backend API Running`);
  console.log(`🌐 Port: ${config.port}`);
  console.log(`🚀 Environment: ${config.env}`);
  console.log(`🔗 Health Check: http://localhost:${config.port}/api/v1/health`);
  console.log(`===============================================`);
});

const shutdown = () => {
  console.log('Shutting down AgriCycle backend gracefully...');
  server.close(() => {
    console.log('AgriCycle backend closed.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
