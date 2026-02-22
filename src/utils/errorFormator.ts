import mongoose from 'mongoose';
import { HttpError } from './htttpError';
import HttpStatus from 'http-status';

const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = HttpStatus;

export const formatMongooseError = (err: unknown) => {
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { status: BAD_REQUEST, message: messages[0] };
  }
  console.log(err, 'eerr');

  if (err instanceof HttpError) {
    return { status: err.status, message: err.message };
  }

  if (err instanceof Error) {
    return { status: BAD_REQUEST, message: err.message };
  }

  return { status: INTERNAL_SERVER_ERROR, message: 'Something went wrong' };
};

export const formatErrors = (errors: string[]) => {
  if (errors.length > 0) {
    const finalError = errors.join('; ');
    throw new Error(
      finalError.charAt(0).toUpperCase() + finalError.slice(1).toLowerCase()
    );
  }
};
