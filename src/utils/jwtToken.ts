import { ObjectId } from 'mongoose';
import { CONFIG_VARS } from '../config/env';
import jwt from 'jsonwebtoken';

const { JWT_SECRET } = CONFIG_VARS;

export const generateJwtToken = (userId: ObjectId): string => {
  return jwt.sign({ _id: userId }, JWT_SECRET);
};

export const verifyJwtToken = (token: string) => {
  const decodedValue = jwt.verify(token, JWT_SECRET);
  return decodedValue;
};
