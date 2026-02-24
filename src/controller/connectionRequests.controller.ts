import { Request, Response, NextFunction } from 'express';
import { ConnectionRequest, User } from '../models';
import HttpStatus from 'http-status';
import { RESPONSE_MESSAGE } from '../constant';
import {
  IApiResponse,
  IConnectionRequest,
  ReceiverId,
  UserDetailsWithId,
} from '../interfaceAndTypes';
import { Types } from 'mongoose';

const { BAD_REQUEST, CREATED } = HttpStatus;
const {
  CONNECTION_REQUESTS_EXIST,
  CONNECTION_REQUEST_SENT,
  SELF_CONNECTION_REQUEST,
  USER_NOT_FOUND,
  CONNECTION_REQUEST_UPDATED,
} = RESPONSE_MESSAGE;

export const sendInterest = async (
  req: Request<ReceiverId>,
  res: Response<IApiResponse<IConnectionRequest>>,
  next: NextFunction
) => {
  const { receiverId, status } = req.params;
  const { _id } = req.user as UserDetailsWithId;

  try {
    if (_id.toString() === receiverId) {
      throw new Error(SELF_CONNECTION_REQUEST);
    }

    const doesReceiverExist = await User.findOne({ _id: receiverId });
    if (!doesReceiverExist) {
      throw new Error(USER_NOT_FOUND);
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: _id, receiver: receiverId },
        { sender: new Types.ObjectId(receiverId), receiver: _id },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status === status) {
        return res
          .status(BAD_REQUEST)
          .json({ message: CONNECTION_REQUESTS_EXIST });
      }

      existingRequest.status = status;
      await existingRequest.save();
      return res.json({ message: CONNECTION_REQUEST_UPDATED });
    }

    const connectionRequest = new ConnectionRequest({
      sender: _id,
      receiver: receiverId,
      status,
    });

    await connectionRequest.save();

    return res.status(CREATED).json({ message: CONNECTION_REQUEST_SENT });
  } catch (error) {
    return next(error);
  }
};
