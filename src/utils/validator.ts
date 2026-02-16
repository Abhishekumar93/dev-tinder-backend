import { Request } from 'express';
import { ILogin, ISignup } from '../interfaceAndTypes';
import validator from 'validator';
import { REGISTER_ALLOWED_FIELDS, REGISTER_REQUIRED_FIELDS } from '../constant';
import { formatErrors } from './errorFormator';

export const registerUserValidator = (req: Request<{}, {}, ISignup>) => {
  const updates = Object.keys(req.body);

  const invalidFields = updates.filter(
    (field) => !REGISTER_ALLOWED_FIELDS.includes(field as keyof ISignup)
  );

  if (invalidFields.length > 0) {
    throw new Error(
      `Invalid signup fields provided: ${invalidFields.join(', ')}`
    );
  }

  const missingFields = REGISTER_REQUIRED_FIELDS.filter(
    (field) => !updates.includes(field)
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  const {
    age,
    gender,
    email,
    firstName,
    lastName,
    password,
    profilePic,
    about,
    bio,
  } = req.body;

  const errors: string[] = [];
  const emailError = validateEmail(email);

  if (typeof age !== 'number' || age < 18)
    errors.push('Age must be a number and at least 18');
  if (!gender || !['male', 'female', 'other'].includes(gender.toLowerCase()))
    errors.push('Gender must be either male, female, or other');
  if (emailError) errors.push(emailError);
  if (
    !firstName ||
    typeof firstName !== 'string' ||
    firstName.trim().length < 2
  )
    errors.push('First name must be a string with at least 2 characters');
  if (
    lastName &&
    (typeof lastName !== 'string' || lastName.trim().length === 0)
  )
    errors.push('Last name must be a non-empty');
  if (password && !validator.isStrongPassword(password))
    errors.push(
      'Password should be at least 8 characters long and must include uppercase letters, lowercase letters, numbers, and symbols'
    );
  if (profilePic && !validator.isURL(profilePic))
    errors.push('Profile picture must be a valid URL');
  if (about && typeof about !== 'string') errors.push('About must be a string');
  if (bio && typeof bio !== 'string') errors.push('Bio must be a string');

  formatErrors(errors);
};

export const validateLoginData = (req: Request<{}, {}, ILogin>) => {
  const { email, password, otp } = req.body;

  const errors: string[] = [];
  const emailError = validateEmail(email);
  if (emailError) errors.push(emailError);
  if (!password && !otp)
    errors.push('Either password or OTP is required for login');

  formatErrors(errors);
};

export const validateEmail = (email: string) => {
  if (!email || !validator.isEmail(email)) {
    return 'Email must be a valid email address';
  }
  return null;
};
