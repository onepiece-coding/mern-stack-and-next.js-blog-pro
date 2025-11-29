import mongoose from 'mongoose';
import { env } from '../env.js';

const connectToDB = async (uri?: string) => {
  const mongoUri = uri ?? env.MONGO_URI;
  if (!mongoUri && env.NODE_ENV !== 'test') {
    throw new Error('Missing MONGO_URI in environment variables');
  }

  if (!mongoUri) return;

  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    throw err;
  }
};

export default connectToDB;