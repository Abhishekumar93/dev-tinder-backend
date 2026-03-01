import z from 'zod';
import { receiverSchema, reviewerSchema } from '../SchemaValidator';
import { Types } from 'mongoose';

export interface IConnectionRequest {
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  status: string;
}

export type ReceiverId = z.infer<typeof receiverSchema>;
export type ReviewerId = z.infer<typeof reviewerSchema>;
