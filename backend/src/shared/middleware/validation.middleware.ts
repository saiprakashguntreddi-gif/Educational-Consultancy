import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponse } from '../utils/api-response';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Update with sanitized/parsed values
      req.body = (parsed as { body?: unknown }).body ?? req.body;
      req.query = (parsed as { query?: unknown }).query as any ?? req.query;
      req.params = (parsed as { params?: unknown }).params as any ?? req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.slice(1).join('.'),
          message: err.message,
        }));
        ApiResponse.error(res, { validationErrors: formattedErrors }, 422, 'Validation failed');
        return;
      }
      ApiResponse.error(res, 'Internal validation error', 500, 'Server Error');
    }
  };
};
