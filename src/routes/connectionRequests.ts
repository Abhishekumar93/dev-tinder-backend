import express from 'express';
import { validateRequest } from '../middleware';
import { receiverSchema, reviewerSchema } from '../SchemaValidator';
import { reviewInterest, sendInterest } from '../controller';

const connectionRequestsRouter = express.Router();

connectionRequestsRouter.post(
  '/send/:status/:receiverId',
  validateRequest({ params: receiverSchema }),
  sendInterest
);
connectionRequestsRouter.post(
  '/review/:status/:senderId',
  validateRequest({ params: reviewerSchema }),
  reviewInterest
);

export default connectionRequestsRouter;
