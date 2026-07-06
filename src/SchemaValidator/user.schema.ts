import { z } from 'zod';
import validator from 'validator';
import { GENDER, RESPONSE_MESSAGE } from '../constant';
import { queryNumericValidation } from '../utils';

const {
  INVALID_EMAIL,
  PASSWORD_OR_OTP_REQUIRED,
  PASSWORD_OTP_REQUIRED,
  PASSWORD_REGEX,
  PASSWORD_MIN_LENGTH,
  INVALID_GENDER,
  PROFILE_PIC_INVALID_URL,
  INVALID_LIMIT,
  INVALID_PAGE,
  REQUIRED_EMAIL,
} = RESPONSE_MESSAGE;

export const emailSchema = z
  .object({
    email: z
      .string(REQUIRED_EMAIL)
      .min(1, REQUIRED_EMAIL)
      .pipe(z.email({ message: INVALID_EMAIL })),
  })
  .strict();

export const authDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters long'),
  lastName: z.string().optional(),
  age: z.number().int().min(18, 'Age must be at least 18'),
  gender: z.enum(GENDER, {
    message: INVALID_GENDER,
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

export const passwordResetSchema = z
  .object({
    password: z
      .string()
      .min(8, PASSWORD_MIN_LENGTH)
      .refine((val) => validator.isStrongPassword(val), {
        message: PASSWORD_REGEX,
      }),
  })
  .strict();
export const registerUserSchema = authDetailsSchema
  .extend(emailSchema.shape)
  .extend(passwordResetSchema.shape)
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
export const feedsQuerySchema = z
  .object({
    page: queryNumericValidation(INVALID_PAGE).optional(),
    limit: queryNumericValidation(INVALID_LIMIT).optional(),
  })
  .strict();
