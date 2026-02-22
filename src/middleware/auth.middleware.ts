import { NextFunction, Request, Response } from 'express';
import { verifyJwtToken } from '../utils/jwtToken';
import { User } from '../models';
import { RESPONSE_MESSAGE } from '../constant';
import { HttpError } from '../utils';
import HttpStatus from 'http-status';

const { UNAUTHORIZED, USER_NOT_FOUND } = RESPONSE_MESSAGE;
const { UNAUTHORIZED: UNAUTHORIZED_STATUS, NOT_FOUND } = HttpStatus;

export const authMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const { token } = req.cookies;
  if (!token) {
    throw new HttpError(UNAUTHORIZED_STATUS, UNAUTHORIZED);
  }

  const decodedCookie = verifyJwtToken(token);
  if (!decodedCookie) {
    throw new HttpError(UNAUTHORIZED_STATUS, UNAUTHORIZED);
  }

  const user = await User.findById(decodedCookie).select(
    '-password -otp -createdAt -updatedAt -__v'
  );
  if (!user) {
    throw new HttpError(NOT_FOUND, USER_NOT_FOUND);
  }

  req.user = user;
  next();
};
