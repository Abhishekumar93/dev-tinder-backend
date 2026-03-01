import { NextFunction, Request, Response } from 'express';
import {
  DbObjectId,
  IApiResponse,
  IUser,
  LoginUserInput,
  RegisterUserInput,
  UserDetails,
} from '../interfaceAndTypes';
import { User } from '../models';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status';
import { RESPONSE_MESSAGE } from '../constant';
import { generateHashPassword, generateJwtToken } from '../utils';
import { CONFIG_VARS } from '../config/env';

const { BAD_REQUEST, CREATED } = HttpStatus;
const {
  USER_ALREADY_EXISTS,
  USER_REGISTERED,
  INVALID_CREDENTIALS,
  PASSWORD_OTP_REQUIRED,
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
} = RESPONSE_MESSAGE;
const { JWT_EXPIRES_IN, NODE_ENV } = CONFIG_VARS;

export const registerUser = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(BAD_REQUEST).json({ message: USER_ALREADY_EXISTS });
    }

    const { password } = req.body;

    const hashedPassword = await generateHashPassword(password);

    const user = new User({
      ...req.body,
      password: hashedPassword,
    });
    await user.save();

    return res.status(CREATED).json({ message: USER_REGISTERED, user });
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    const { email, password, otp } = req.body;

    const user: (IUser & DbObjectId) | null = await User.findOne({
      email,
    });
    if (!user) {
      return res.status(BAD_REQUEST).json({ message: INVALID_CREDENTIALS });
    }

    if (password && otp) {
      throw new Error(PASSWORD_OTP_REQUIRED);
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(BAD_REQUEST).json({ message: INVALID_CREDENTIALS });
      }
    } else if (otp !== user.otp) {
      return res.status(BAD_REQUEST).json({ message: INVALID_CREDENTIALS });
    }

    const { age, firstName, lastName, gender, about, bio, profilePic } = user;
    const data: UserDetails = {
      firstName,
      lastName,
      email: user.email,
      age,
      gender,
      about,
      bio,
      profilePic,
    };

    const token = await generateJwtToken(user._id);
    res.cookie('token', token, {
      httpOnly: true,
      secure: NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: JWT_EXPIRES_IN * 1000,
    });

    return res.json({
      message: USER_LOGGED_IN,
      data,
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutUser = (_req: Request, res: Response) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.setHeader('Clear-Site-Data', '"storage", "cache"');
  return res.json({ message: USER_LOGGED_OUT });
};
