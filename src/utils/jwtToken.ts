import { ObjectId } from 'mongoose';
import { CONFIG_VARS } from '../config/env';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { RESPONSE_MESSAGE } from '../constant';

const { JWT_SECRET, JWT_EXPIRES_IN } = CONFIG_VARS;

export const generateJwtToken = (userId: ObjectId): string => {
  return jwt.sign({ _id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyJwtToken = (token: string): ObjectId => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      _id: ObjectId;
    };

    return decoded._id;
  } catch {
    throw new Error(RESPONSE_MESSAGE.UNAUTHORIZED);
  }
};
