import express from 'express';
import { validateRequest } from '../middleware';
import { receiverSchema } from '../SchemaValidator';
import { sendInterest } from '../controller/connectionRequests.controller';

const connectionRequestsRouter = express.Router();

connectionRequestsRouter.post(
  '/send/:status/:receiverId',
  validateRequest({ params: receiverSchema }),
  sendInterest
);

export default connectionRequestsRouter;
