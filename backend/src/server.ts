import mongoose from 'mongoose';
import app from './app.js';
import { env } from './env.js';
import connectToDB from './config/connectToDb.js';

// Global error handlers
process.on('uncaughtException', (err: unknown) => {
  console.error('Uncaught Exception', err);
  process.exit(1);
});
process.on('unhandledRejection', (err: unknown) => {
  console.error('Unhandled Rejection', err);
  process.exit(1);
});

const PORT = env.PORT ?? 8000;

try {
  await connectToDB(env.MONGO_URI);
} catch (err) {
  console.error('Failed to connect to DB at startup', err);
  process.exit(1);
}

const server = app.listen(PORT, () => {
  console.log(`Server running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Graceful shutdown handlers
for (const sig of ['SIGINT', 'SIGTERM'] as const) {
  process.on(sig, async () => {
    console.log(`${sig} received, shutting down gracefully…`);
    server.close(async (err?: Error) => {
      if (err) console.error('Error closing HTTP server', err);
      try {
        await mongoose.disconnect();
        console.log('MongoDB connection closed');
      } catch (dbErr) {
        console.error('Error disconnecting MongoDB', dbErr);
      }
      process.exit(0);
    });
  });
}