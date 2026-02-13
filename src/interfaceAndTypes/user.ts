export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  otp?: string;
  age: number;
  profilePic?: string;
  gender: string;
  createdAt?: Date;
  updatedAt?: Date;
}
