import { Router } from 'express';
import { loginUser, logoutUser, registerUser } from '../controller';
import { loginUserSchema, registerUserSchema } from '../SchemaValidator';
import { validateRequest } from '../middleware';

const authRoutes = Router();

authRoutes.post(
  '/signup',
  validateRequest({ body: registerUserSchema }),
  registerUser
);
authRoutes.post(
  '/login',
  validateRequest({ body: loginUserSchema }),
  loginUser
);
authRoutes.post('/logout', logoutUser);

export default authRoutes;
