import { NextFunction, Request, Response } from 'express';
import {
  IApiListResponse,
  IApiResponse,
  IEmail,
  ISignup,
  UserDetails,
} from '../interfaceAndTypes';
import { User } from '../models';
import { ObjectId } from 'mongoose';

export const getUserDetail = async (
  req: Request<{}, {}, IEmail>,
  res: Response<IApiResponse<UserDetails>>
) => {
  const email = req.body.email;

  try {
    const user: UserDetails | null = await User.findOne({ email }).select(
      '-password -otp -createdAt -updatedAt -__v'
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User found', data: user });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
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
      message: 'Users list retrieved successfully',
      data: { count: users.length, records: users },
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateUserDetail = async (
  req: Request<{ userId: ObjectId }, {}, Partial<Omit<ISignup, 'email'>>>,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const allowedFields: (keyof Omit<ISignup, 'email'>)[] = [
      'about',
      'age',
      'bio',
      'firstName',
      'gender',
      'lastName',
      'password',
      'profilePic',
    ];

    const updates = Object.keys(req.body);

    const invalidFields = updates.filter(
      (field) => !allowedFields.includes(field as keyof Omit<ISignup, 'email'>)
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        message: `Invalid update fields provided: ${invalidFields.join(', ')}`,
      });
    }

    const user: UserDetails | null = await User.findByIdAndUpdate(
      userId,
      req.body,
      { returnDocument: 'after', runValidators: true }
    ).select('-password -otp -createdAt -updatedAt -__v');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (
  req: Request<{ userId: ObjectId }, {}, {}>,
  res: Response<IApiResponse<UserDetails>>
) => {
  try {
    const { userId } = req.params;
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'Delete failed: User not found' });
    }

    res.json({
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};
