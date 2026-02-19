import { Router } from 'express';
import {
  deleteUser,
  getUserDetail,
  getUserLists,
  updateUserDetail,
} from '../controller';
import { validateRequest } from '../middleware';
import { updateUserSchema } from '../SchemaValidator';

const userRoutes = Router();

userRoutes.get('/list', getUserLists);
userRoutes.patch(
  '/:userId',
  validateRequest({ body: updateUserSchema }),
  updateUserDetail
);
userRoutes.delete('/:userId', deleteUser);
userRoutes.get('/', getUserDetail);

export default userRoutes;
