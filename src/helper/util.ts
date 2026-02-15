import mongoose from 'mongoose';

export const formatMongooseError = (err: unknown) => {
  if (err instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(err.errors).map((e) => e.message);
    return { status: 400, message: messages[0] };
  }

  if (err instanceof Error) {
    return { status: 400, message: err.message };
  }

  return { status: 500, message: 'Something went wrong' };
};

export const errorFormater = (errors: string[]) => {
  if (errors.length > 0) {
    const finalError = errors.join('; ');
    throw new Error(
      finalError.charAt(0).toUpperCase() + finalError.slice(1).toLowerCase()
    );
  }
};
