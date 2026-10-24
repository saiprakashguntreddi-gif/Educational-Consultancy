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

  const statusCode = (err as any).statusCode || (err as any).status || 500;
  let message = err.message || 'Internal server error';

  if ((err as any).type === 'entity.too.large' || err.name === 'PayloadTooLargeError') {
    message = 'Uploaded document or request payload is too large. Maximum supported request size is 10MB.';
  }

  ApiResponse.error(
    res,
    process.env.NODE_ENV === 'development' && statusCode === 500 ? err.stack || message : message,
    statusCode,
    statusCode === 413 ? 'Payload Too Large' : 'Internal Server Error'
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, 404, 'Not Found');
};
