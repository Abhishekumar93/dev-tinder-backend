import { Router } from 'express';
import {
  deleteUser,
  getUserDetail,
  getUserLists,
  updateUserDetail,
} from '../controller';

const userRoutes = Router();

userRoutes.get('/list', getUserLists);
userRoutes.patch('/:userId', updateUserDetail);
userRoutes.delete('/:userId', deleteUser);
userRoutes.get('/', getUserDetail);

export default userRoutes;
