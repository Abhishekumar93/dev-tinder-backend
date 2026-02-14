export interface IEmail {
  email: string;
}

export interface ILogin extends IEmail {
  password: string;
}

export interface IUserAbout {
  profilePic?: string;
  gender: string;
  about?: string;
  bio?: string;
}

export interface ISignup extends IEmail, IUserAbout {
  firstName: string;
  lastName: string;
  password?: string;
  age: number;
}

export interface IUser extends ISignup {
  otp?: string;
}

export type UserDetails = Omit<IUser, 'password' | 'otp'>;
