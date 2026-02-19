import mongoose from 'mongoose';
import { IUser } from '../interfaceAndTypes/user';
import validator from 'validator';
import { RESPONSE_MESSAGE } from '../constant';

const { Schema } = mongoose;
const {
  INVALID_EMAIL,
  PASSWORD_REGEX,
  INVALID_GENDER,
  PROFILE_PIC_INVALID_URL,
} = RESPONSE_MESSAGE;

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
          throw new Error(INVALID_EMAIL);
        }
      },
    },
    password: {
      type: String,
      minLength: 8,
      required: true,
      validate(value: string) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(PASSWORD_REGEX);
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
          throw new Error(PROFILE_PIC_INVALID_URL);
        }
      },
    },
    gender: {
      type: String,
      required: true,
      validate(value: string) {
        if (!['male', 'female', 'other'].includes(value.toLowerCase())) {
          throw new Error(INVALID_GENDER);
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
