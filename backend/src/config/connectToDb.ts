import mongoose from 'mongoose';
import { env } from '../env.js';
import logger from '../utils/logger.js';

const connectToDB = async (uri?: string) => {
  const mongoUri = uri ?? env.MONGO_URI;
  if (!mongoUri && env.NODE_ENV !== 'test') {
    throw new Error('Missing MONGO_URI in environment variables');
  }

  if (!mongoUri) return;

  try {
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('Error connecting to MongoDB', err);
    throw err;
  }
};

export default connectToDB;
