import { NextFunction, Request, Response } from 'express';
import { IApiResponse, ISignup, IUser } from '../interfaceAndTypes';
import { User } from '../models';
import { registerUserValidator, validateLoginData } from '../helper/validator';
import bcrypt from 'bcrypt';
import { ILogin, UserDetails } from '../interfaceAndTypes/user';

export const registerUser = async (
  req: Request<{}, {}, ISignup>,
  res: Response,
  next: NextFunction
) => {
  const { email } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    registerUserValidator(req);

    const { password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({ ...req.body, password: hashedPassword });
    await user.save();

    res.json({ message: 'User created successfully', user });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (
  req: Request<{}, {}, ILogin>,
  res: Response<IApiResponse<UserDetails>>,
  next: NextFunction
) => {
  try {
    validateLoginData(req);

    const { email, password, otp } = req.body;

    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (password && otp) {
      throw new Error('Provide either password or OTP, not both');
    }

    if (password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    } else if (otp) {
      if (otp !== user.otp) {
        return res.status(400).json({ message: 'Invalid OTP' });
      }
    } else {
      return res
        .status(400)
        .json({ message: 'Password or OTP is required for login' });
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
      message: 'Login successful',
      data,
    });
  } catch (error) {
    return next(error);
  }
};
