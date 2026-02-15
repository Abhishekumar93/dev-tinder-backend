import { Router } from 'express';
import { registerUser } from '../controller';

const authRoutes = Router();

authRoutes.post('/signup', registerUser);

export default authRoutes;
