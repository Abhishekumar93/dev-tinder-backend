import { ISignup } from '../interfaceAndTypes';

export const REGISTER_ALLOWED_FIELDS: (keyof ISignup)[] = [
  'about',
  'age',
  'bio',
  'email',
  'firstName',
  'gender',
  'lastName',
  'password',
  'profilePic',
];

export const REGISTER_REQUIRED_FIELDS: (keyof ISignup)[] = [
  'age',
  'email',
  'firstName',
  'gender',
  'password',
];
