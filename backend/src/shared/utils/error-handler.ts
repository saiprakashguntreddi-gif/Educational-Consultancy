export class AppError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function notFound(message = 'Resource not found'): never {
  throw new AppError(message, 404);
}

export function badRequest(message = 'Bad request'): never {
  throw new AppError(message, 400);
}

export function forbidden(message = 'Forbidden'): never {
  throw new AppError(message, 403);
}

export function unauthorized(message = 'Unauthorized'): never {
  throw new AppError(message, 401);
}
