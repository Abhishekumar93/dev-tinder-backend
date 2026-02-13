import mongoose from 'mongoose';
import { IUser } from '../interfaceAndTypes/user';

const { Schema } = mongoose;

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: String,
  otp: String,
  age: { type: Number, required: true },
  profilePic: String,
  gender: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

export default User;
