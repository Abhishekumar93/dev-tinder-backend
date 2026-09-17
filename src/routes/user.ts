import { Router } from 'express';
import {
  deleteUser,
  getAllConnections,
  getAllPendingRequests,
  getLoggedInUserDetail,
  getUserFeeds,
  getUserLists,
  updatePassword,
  updateUserDetail,
} from '../controller';
import { validateRequest } from '../middleware';
import {
  feedsQuerySchema,
  passwordResetSchema,
  updateUserSchema,
} from '../SchemaValidator';

const userRoutes = Router();

userRoutes.get('/list', getUserLists);
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
userRoutes.get('/connections', getAllConnections);
userRoutes.get('/pending-requests', getAllPendingRequests);
userRoutes.get(
  '/feed',
  validateRequest({ query: feedsQuerySchema }),
  getUserFeeds
);
userRoutes.delete('/', deleteUser);
userRoutes.get('/', getLoggedInUserDetail);

export default userRoutes;
