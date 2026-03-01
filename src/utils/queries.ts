import { z } from 'zod';

export const queryNumericValidation = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^[1-9]\d*$/, { message })
    .transform(Number);
