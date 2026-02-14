export interface IEmail {
  email: string;
}

export interface ILogin extends IEmail {
  password: string;
}

export interface ISignup extends IEmail {
  firstName: string;
  lastName: string;
  password?: string;
  age: number;
}

export interface IUser extends ISignup {
  otp?: string;
  profilePic?: string;
  gender: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserDetails = Omit<
  IUser,
  'password' | 'otp' | 'createdAt' | 'updatedAt'
>;
