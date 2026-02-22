import { Router } from 'express';
import {
  deleteUser,
  getLoggedInUserDetail,
  getUserDetail,
  getUserLists,
  updateUserDetail,
} from '../controller';
import { validateRequest } from '../middleware';
import { emailSchema, updateUserSchema } from '../SchemaValidator';

const userRoutes = Router();

userRoutes.get('/list', getUserLists);
userRoutes.patch(
  '/:userId',
  validateRequest({ body: updateUserSchema }),
  updateUserDetail
);
userRoutes.delete('/:userId', deleteUser);
userRoutes.get(
  '/profile',
  validateRequest({ body: emailSchema }),
  getUserDetail
);
userRoutes.get('/', getLoggedInUserDetail);

export default userRoutes;
