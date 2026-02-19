import { NextFunction, Request, Response } from 'express';
import { IApiResponse, IUser, UserDetails } from '../interfaceAndTypes';
import { User } from '../models';
import bcrypt from 'bcrypt';
import HttpStatus from 'http-status';
import { RESPONSE_MESSAGE } from '../constant';
import { loginUserInput, registerUserInput } from '../interfaceAndTypes/user';

const { BAD_REQUEST } = HttpStatus;
const {
  USER_ALREADY_EXISTS,
  USER_REGISTERED,
  INVALID_CREDENTIALS,
  PASSWORD_OTP_REQUIRED,
  USER_LOGGED_IN,
} = RESPONSE_MESSAGE;

export const registerUser = async (
  req: Request<{}, {}, registerUserInput>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(BAD_REQUEST).json({ message: USER_ALREADY_EXISTS });
    }

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();

    res.json({ message: USER_REGISTERED, user });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request<{}, {}, loginUserInput>,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    const { email, password, otp } = req.body;

    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      return res.status(BAD_REQUEST).json({ message: INVALID_CREDENTIALS });
    }

    if (password && otp) {
      throw new Error(PASSWORD_OTP_REQUIRED);
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(BAD_REQUEST).json({ message: INVALID_CREDENTIALS });
      }
    } else if (otp !== user.otp) {
      return res.status(BAD_REQUEST).json({ message: INVALID_CREDENTIALS });
    }

    const { age, firstName, lastName, gender, about, bio, profilePic } = user;
    const data: UserDetails = {
      firstName,
      lastName,
      email: user.email,
      age,
      gender,
      about,
      bio,
      profilePic,
    };
    return res.json({
      message: USER_LOGGED_IN,
      data,
    });
  } catch (error) {
    return next(error);
  }
};
