import mongoose from 'mongoose';
import { CONFIG_VARS } from './env';

export const connectDB = async () => {
  try {
    await mongoose.connect(CONFIG_VARS.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('🔌 DB Disconnected Successfully!');
  } catch (error) {
    console.error('❌ Disconnection Failed:', error);
  }
};
