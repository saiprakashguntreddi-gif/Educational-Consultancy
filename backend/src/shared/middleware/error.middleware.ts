import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/api-response';
import { logger } from '../utils/logger';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  logger.error('Unhandled server error:', err);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal server error';

  ApiResponse.error(
    res,
    process.env.NODE_ENV === 'development' ? err.stack || message : message,
    statusCode,
    'Internal Server Error'
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, 'Not Found');
};
