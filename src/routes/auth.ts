import { Router } from 'express';
import { loginUser, registerUser } from '../controller';
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

export default authRoutes;
