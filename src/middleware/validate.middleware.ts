import { NextFunction, Request, Response } from 'express';
import { ZodType } from 'zod';
import { formatErrors } from '../utils';

export const validateRequest =
  <TBody = unknown, TParams = unknown, TQuery = unknown>(schemas: {
    body?: ZodType<TBody>;
    params?: ZodType<TParams>;
    query?: ZodType<TQuery>;
  }) =>
  (
    req: Request<TParams, any, TBody, TQuery>,
    _res: Response,
    next: NextFunction
  ) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        return handleError(result.error.issues);
      }
      req.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        return handleError(result.error.issues);
      }
      req.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        return handleError(result.error.issues);
      }
      req.query = result.data;
    }

    return next();
  };

const handleError = (errors: any[]) => {
  const errorMessages = errors.map((issue) => {
    if (issue.code === 'invalid_type') {
      return `${issue.message} at ${issue.path[0]}`;
    }

    return issue.message;
  });
  return formatErrors(errorMessages);
};
