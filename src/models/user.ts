import mongoose from 'mongoose';
import { IUser } from '../interfaceAndTypes/user';
import validator from 'validator';

const { Schema } = mongoose;

const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2 },
    lastName: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      immutable: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error('Email is not valid');
        }
      },
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
      validate(value: string) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            'Password must include uppercase letters, lowercase letters, numbers, and symbols'
          );
        }
      },
    },
    otp: { type: String, minLength: 6, maxLength: 6 },
    age: { type: Number, required: true, min: 18 },
    profilePic: {
      type: String,
      default: 'https://openclipart.org/image/800px/346569',
      validate(value: string) {
        if (!validator.isURL(value)) {
          throw new Error('Profile picture must be a valid URL');
        }
      },
    },
    gender: {
      type: String,
      required: true,
      validate(value: string) {
        if (!['male', 'female', 'other'].includes(value.toLowerCase())) {
          throw new Error('Gender must be either male, female, or other');
        }
      },
    },
    about: { type: String, trim: true },
    bio: { type: String, trim: true },
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);

export default User;
