import z from 'zod';
import {
  loginUserSchema,
  registerUserSchema,
  updateUserSchema,
} from '../SchemaValidator';
import { emailSchema, userIdSchema } from '../SchemaValidator/user.schema';

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

export type UserDetails = Omit<IUser, 'password' | 'otp'>;

export type registerUserInput = z.infer<typeof registerUserSchema>;
export type updateUserInput = z.infer<typeof updateUserSchema>;
export type loginUserInput = z.infer<typeof loginUserSchema>;
export type userIdParams = z.infer<typeof userIdSchema>;
export type userEmail = z.infer<typeof emailSchema>;
