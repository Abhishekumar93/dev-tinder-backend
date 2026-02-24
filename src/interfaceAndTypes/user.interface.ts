import z from 'zod';
import {
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
} from '../SchemaValidator';
import {
  emailSchema,
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

export type registerUserInput = z.infer<typeof registerUserSchema>;
export type updateUserInput = z.infer<typeof updateUserSchema>;
export type loginUserInput = z.infer<typeof loginUserSchema>;
export type userEmail = z.infer<typeof emailSchema>;
export type userPassword = z.infer<typeof passwordResetSchema>;
