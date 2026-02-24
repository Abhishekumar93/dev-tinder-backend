import { NextFunction, Request, Response } from 'express';
import {
  IApiListResponse,
  IApiResponse,
  updateUserInput,
  UserDetails,
  UserDetailsWithId,
  userEmail,
  userPassword,
} from '../interfaceAndTypes';
import { User } from '../models';
import HttpStatus from 'http-status';
import { RESPONSE_MESSAGE } from '../constant';
import { generateHashPassword } from '../utils';

const { NOT_FOUND } = HttpStatus;
const {
  USER_NOT_FOUND,
  USER_RETRIEVED,
  USER_LIST_RETRIEVED,
  USER_UPDATED,
  USER_DELETED,
} = RESPONSE_MESSAGE;

export const getLoggedInUserDetail = async (
  req: Request,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    const user = req.user as UserDetails;
    return res.json({ message: USER_RETRIEVED, data: user });
  } catch (error) {
    return next(error);
  }
};

export const getUserDetail = async (
  req: Request<{}, {}, userEmail>,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  const email = req.body.email;

  try {
    const user: UserDetails | null = await User.findOne({ email }).select(
      '-password -otp -createdAt -updatedAt -__v'
    );
    if (!user) {
      return res.status(NOT_FOUND).json({ message: USER_NOT_FOUND });
    }
    return res.json({ message: USER_RETRIEVED, data: user });
  } catch (error) {
    return next(error);
  }
};

export const getUserLists = async (
  _req: Request,
  res: Response<IApiListResponse<UserDetails[]>>,
  next: NextFunction
) => {
  try {
    const users: UserDetails[] = await User.find()
      .select('-password -otp -createdAt -updatedAt -__v')
      .sort({ createdAt: -1 });

    return res.json({
      message: USER_LIST_RETRIEVED,
      data: { count: users.length, records: users },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUserDetail = async (
  req: Request<{}, {}, updateUserInput>,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    const { _id } = req.user as UserDetailsWithId;

    const user = (await User.findByIdAndUpdate(_id, req.body, {
      returnDocument: 'after',
      runValidators: true,
    }).select('-password -otp -createdAt -updatedAt -__v')) as UserDetails;

    return res.json({
      message: USER_UPDATED,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    const { _id } = req.user as UserDetailsWithId;
    await User.findByIdAndDelete(_id);
    return res.json({
      message: USER_DELETED,
    });
  } catch (error) {
    return next(error);
  }
};

export const updatePassword = async (
  req: Request<{}, {}, userPassword>,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    const { _id } = req.user as UserDetailsWithId;
    const { password } = req.body;

    const hashedPassword = await generateHashPassword(password);

    const user = (await User.findByIdAndUpdate(
      _id,
      { password: hashedPassword },
      {
        returnDocument: 'after',
        runValidators: true,
      }
    ).select('-password -otp -createdAt -updatedAt -__v')) as UserDetails;

    return res.json({
      message: USER_UPDATED,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};
