import { Router } from 'express';
import {
  deleteUser,
  getLoggedInUserDetail,
  getUserDetail,
  getUserLists,
  updatePassword,
  updateUserDetail,
} from '../controller';
import { validateRequest } from '../middleware';
import { emailSchema, updateUserSchema } from '../SchemaValidator';
import { passwordResetSchema } from '../SchemaValidator/user.schema';

const userRoutes = Router();

userRoutes.get('/list', getUserLists);
userRoutes.get(
  '/profile',
  validateRequest({ body: emailSchema }),
  getUserDetail
);
userRoutes.patch(
  '/update-password',
  validateRequest({ body: passwordResetSchema }),
  updatePassword
);
userRoutes.patch(
  '/',
  validateRequest({ body: updateUserSchema }),
  updateUserDetail
);
userRoutes.delete('/', deleteUser);
userRoutes.get('/', getLoggedInUserDetail);

export default userRoutes;
