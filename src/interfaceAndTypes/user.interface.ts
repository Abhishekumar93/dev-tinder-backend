import z from 'zod';
import {
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
} from '../SchemaValidator';
import {
  emailSchema,
  feedsQuerySchema,
  passwordResetSchema,
} from '../SchemaValidator/user.schema';
import { ObjectId } from 'mongoose';

export interface IUser {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  profilePic?: string;
  gender: string;
  about?: string;
  bio?: string;
  otp?: string;
}

export type DbObjectId = { _id: ObjectId };
export type UserDetails = Omit<IUser, 'password' | 'otp'>;
export type UserDetailsWithId = UserDetails & DbObjectId;

export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type UserEmail = z.infer<typeof emailSchema>;
export type UserPassword = z.infer<typeof passwordResetSchema>;

export type FeedQuery = z.infer<typeof feedsQuerySchema>;
