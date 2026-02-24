import bcrypt from 'bcrypt';

export const generateHashPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};
