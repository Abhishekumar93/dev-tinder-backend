import mongoose from 'mongoose';
import { IUser } from '../interfaceAndTypes/user';

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
    },
    password: String,
    otp: String,
    age: { type: Number, required: true, min: 18 },
    profilePic: {
      type: String,
      default: 'https://openclipart.org/image/800px/346569',
    },
    gender: {
      type: String,
      required: true,
      validate(value: string) {
        if (!['male', 'female', 'other'].includes(value.toLowerCase())) {
          throw new Error('Gender is not valid');
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
