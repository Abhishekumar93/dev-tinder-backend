import { NextFunction, Request, Response } from 'express';
import {
  IApiListResponse,
  IApiResponse,
  UserDetails,
} from '../interfaceAndTypes';
import { User } from '../models';
import HttpStatus from 'http-status';
import { RESPONSE_MESSAGE } from '../constant';
import {
  updateUserInput,
  userEmail,
  userIdParams,
} from '../interfaceAndTypes/user';

const { INTERNAL_SERVER_ERROR, NOT_FOUND } = HttpStatus;
const {
  USER_NOT_FOUND,
  SOMETHING_WENT_WRONG,
  USER_RETRIEVED,
  USER_LIST_RETRIEVED,
  USER_UPDATED,
  USER_DELETED,
  DELETE_USER_FAILED,
} = RESPONSE_MESSAGE;

export const getUserDetail = async (
  req: Request<{}, {}, userEmail>,
  res: Response<IApiResponse<UserDetails>>
) => {
  const email = req.body.email;

  try {
    const user: UserDetails | null = await User.findOne({ email }).select(
      '-password -otp -createdAt -updatedAt -__v'
    );
    if (!user) {
      return res.status(NOT_FOUND).json({ message: USER_NOT_FOUND });
    }
    res.json({ message: USER_RETRIEVED, data: user });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: SOMETHING_WENT_WRONG });
  }
};

export const getUserLists = async (
  _req: Request,
  res: Response<IApiListResponse<UserDetails[]>>
) => {
  try {
    const users: UserDetails[] = await User.find()
      .select('-password -otp -createdAt -updatedAt -__v')
      .sort({ createdAt: -1 });

    res.json({
      message: USER_LIST_RETRIEVED,
      data: { count: users.length, records: users },
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: SOMETHING_WENT_WRONG });
  }
};

export const updateUserDetail = async (
  req: Request<userIdParams, {}, updateUserInput>,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const user: UserDetails | null = await User.findByIdAndUpdate(
      userId,
      req.body,
      { returnDocument: 'after', runValidators: true }
    ).select('-password -otp -createdAt -updatedAt -__v');

    if (!user) {
      return res.status(NOT_FOUND).json({ message: USER_NOT_FOUND });
    }

    res.json({
      message: USER_UPDATED,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request<userIdParams, {}, {}>,
  res: Response<IApiResponse<UserDetails>>
) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(NOT_FOUND).json({ message: DELETE_USER_FAILED });
    }

    res.json({
      message: USER_DELETED,
    });
  } catch (error) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: SOMETHING_WENT_WRONG });
  }
};
