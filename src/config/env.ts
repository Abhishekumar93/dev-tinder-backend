import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const requireEnv = (name: string): string => {
  const envValue = process.env[name];
  if (!envValue) {
    throw new Error(`Environment variable ${name} is required but not set.`);
  }
  return envValue;
};

export const CONFIG_VARS = {
  NODE_ENV: requireEnv('NODE_ENV'),
  PORT: Number(process.env.PORT || 8000),
  MONGO_URI: requireEnv('REACT_MONGO_URI'),
  JWT_SECRET: requireEnv('JWT_SECRET'),
  JWT_EXPIRES_IN: requireEnv('JWT_EXPIRES_IN') || '1d',
};
