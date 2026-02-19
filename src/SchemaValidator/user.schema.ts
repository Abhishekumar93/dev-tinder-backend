import { z } from 'zod';
import validator from 'validator';
import { RESPONSE_MESSAGE } from '../constant';

const {
  INVALID_EMAIL,
  PASSWORD_OR_OTP_REQUIRED,
  PASSWORD_OTP_REQUIRED,
  PASSWORD_REGEX,
  PASSWORD_MIN_LENGTH,
  INVALID_GENDER,
  PROFILE_PIC_INVALID_URL,
} = RESPONSE_MESSAGE;

export const emailSchema = z.object({
  email: z.string().refine((val) => validator.isEmail(val), {
    message: INVALID_EMAIL,
  }),
});

export const authDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters long'),
  lastName: z.string().optional(),
  age: z.number().int().min(18, 'Age must be at least 18'),
  gender: z.enum(['male', 'female', 'other'], {
    message: INVALID_GENDER,
  }),
  password: z
    .string()
    .min(8, PASSWORD_MIN_LENGTH)
    .refine((val) => validator.isStrongPassword(val), {
      message: PASSWORD_REGEX,
    }),
  profilePic: z
    .string()
    .refine((val) => validator.isURL(val), {
      message: PROFILE_PIC_INVALID_URL,
    })
    .optional(),
  about: z.string().optional(),
  bio: z.string().optional(),
});

export const registerUserSchema = authDetailsSchema
  .extend(emailSchema.shape)
  .strict();
export const updateUserSchema = authDetailsSchema.partial().strict();

export const loginUserSchema = z
  .object({
    password: z.string().optional(),
    otp: z.string().optional(),
  })
  .extend(emailSchema.shape)
  .strict()
  .superRefine((data, ctx) => {
    if (!data.password && !data.otp) {
      ctx.addIssue({
        code: 'custom',
        message: PASSWORD_OR_OTP_REQUIRED,
        path: ['password', 'otp'],
      });
    }

    if (data.password && data.otp) {
      ctx.addIssue({
        code: 'custom',
        message: PASSWORD_OTP_REQUIRED,
        path: ['password', 'otp'],
      });
    }
  });

export const userIdSchema = z.object({
  userId: z.string().refine((val) => validator.isMongoId(val), {
    message: 'Invalid URL',
  }),
});
