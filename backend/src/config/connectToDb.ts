import mongoose from 'mongoose';
import { env } from '../env.js';
import logger from '../utils/logger.js';

const connectToDB = async (
  uri?: string,
  options?: { env?: { NODE_ENV?: string; MONGO_URI?: string; [k: string]: any }; mongooseClient?: typeof mongoose },
) => {
  const usedEnv = options?.env ?? env;
  const mongoUri = uri ?? usedEnv.MONGO_URI;

  // In non-test env require a real MONGO_URI
  if (!mongoUri && usedEnv.NODE_ENV !== 'test') {
    throw new Error('Missing MONGO_URI in environment variables');
  }

  if (!mongoUri) return;

  const client = options?.mongooseClient ?? mongoose;

  try {
    await client.connect(mongoUri);
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error('Error connecting to MongoDB', err);
    throw err;
  }
};

export default connectToDB;
