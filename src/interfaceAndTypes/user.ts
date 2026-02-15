export interface IEmail {
  email: string;
}

export interface IUserAbout {
  password: string;
  profilePic?: string;
  gender: string;
  about?: string;
  bio?: string;
}

export interface ISignup extends IEmail, IUserAbout {
  firstName: string;
  lastName: string;
  age: number;
}

export interface IUser extends ISignup {
  otp?: string;
}

export type UserDetails = Omit<IUser, 'password' | 'otp'>;

export type UserPasswordOtp = Pick<IUser, 'password' | 'otp'>;
type LoginRequiredFields = Pick<IUser, 'email'>;
type LoginOptionalFields = Partial<UserPasswordOtp>;

export type ILogin = LoginRequiredFields & LoginOptionalFields;
