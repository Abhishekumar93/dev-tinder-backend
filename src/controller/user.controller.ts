import { NextFunction, Request, Response } from 'express';
import {
  IApiListResponse,
  IApiResponse,
  FeedQuery,
  UpdateUserInput,
  UserDetails,
  UserDetailsWithId,
  UserEmail,
  UserPassword,
} from '../interfaceAndTypes';
import { ConnectionRequest, User } from '../models';
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
  req: Request<{}, {}, UserEmail>,
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
  req: Request<{}, {}, UpdateUserInput>,
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
  req: Request<{}, {}, UserPassword>,
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

export const getAllPendingRequests = async (
  req: Request,
  res: Response<IApiListResponse<UserDetails[]>>,
  next: NextFunction
) => {
  try {
    const { _id } = req.user as UserDetailsWithId;

    const pendingConnectionRequests = await ConnectionRequest.find({
      receiver: _id,
      status: 'interested',
    })
      .populate<{ sender: UserDetails }>('sender', [
        'firstName',
        'lastName',
        'email',
        'profilePic',
        'age',
        'gender',
      ])
      .sort({ createdAt: -1 });

    const pendingRequests: UserDetails[] = pendingConnectionRequests.map(
      (request) => request.sender
    );
    return res.json({
      message: USER_LIST_RETRIEVED,
      data: { count: pendingRequests.length, records: pendingRequests },
    });
  } catch (error) {
    return next(error);
  }
};

export const getAllConnections = async (
  req: Request,
  res: Response<IApiListResponse<UserDetails[]>>,
  next: NextFunction
) => {
  try {
    const { _id } = req.user as UserDetailsWithId;

    const connections = await ConnectionRequest.find({
      $or: [{ sender: _id }, { receiver: _id }],
      status: 'accepted',
    })
      .populate<{ sender: UserDetailsWithId; receiver: UserDetailsWithId }>(
        'sender receiver',
        ['firstName', 'lastName', 'email', 'profilePic', 'age']
      )
      .sort({ createdAt: -1 });

    const connectedUsers: UserDetails[] = connections.map((connection) =>
      connection.sender._id.toString() === _id.toString()
        ? connection.receiver
        : connection.sender
    );

    return res.json({
      message: USER_LIST_RETRIEVED,
      data: { count: connectedUsers.length, records: connectedUsers },
    });
  } catch (error) {
    return next(error);
  }
};

export const getUserFeeds = async (
  req: Request<{}, {}, {}, FeedQuery>,
  res: Response<IApiListResponse<UserDetails[]>>,
  next: NextFunction
) => {
  try {
    const { _id } = req.user as UserDetailsWithId;

    const { page = 1 } = req.query;
    let { limit = 10 } = req.query;
    limit = Math.min(limit, 50);

    const connections = await ConnectionRequest.find({
      $or: [{ sender: _id }, { receiver: _id }],
    });

    const allConnectedUserIds = new Set<string>();
    allConnectedUserIds.add(_id.toString());
    connections.forEach((connection) => {
      const senderId = connection.sender._id.toString();
      const receiverId = connection.receiver._id.toString();
      allConnectedUserIds.add(senderId);
      allConnectedUserIds.add(receiverId);
    });

    const userFeeds = await User.find({
      _id: { $nin: Array.from(allConnectedUserIds) },
    })
      .select('-password -otp -createdAt -updatedAt -__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      message: USER_LIST_RETRIEVED,
      data: { count: userFeeds.length, records: userFeeds },
    });
  } catch (error) {
    return next(error);
  }
};
