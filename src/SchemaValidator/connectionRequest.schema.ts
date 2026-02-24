import { z } from 'zod';
import validator from 'validator';
import { CONNECTION_SENT_STATUS, RESPONSE_MESSAGE } from '../constant';

const { INVALID_URL, INVALID_CONNECTION_STATUS } = RESPONSE_MESSAGE;

export const receiverSchema = z
  .object({
    receiverId: z.string().refine((val) => validator.isMongoId(val), {
      message: INVALID_URL,
    }),
    status: z.string().refine((val) => CONNECTION_SENT_STATUS.includes(val), {
      message: INVALID_CONNECTION_STATUS,
    }),
  })
  .strict();

export const requestReviewerSchema = z
  .object({
    receiverId: z.string().refine((val) => validator.isMongoId(val), {
      message: INVALID_URL,
    }),
    status: z.string().refine((val) => CONNECTION_SENT_STATUS.includes(val), {
      message: INVALID_CONNECTION_STATUS,
    }),
  })
  .strict();
