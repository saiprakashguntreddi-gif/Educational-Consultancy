import { Response } from 'express';

export interface ApiResponsePayload<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string | Record<string, unknown>;
  timestamp: string;
}

export class ApiResponse {
  public static success<T>(
    res: Response,
    data?: T,
    message = 'Request successful',
    statusCode = 200
  ): Response {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }

  public static created<T>(
    res: Response,
    data: T,
    message = 'Resource created successfully'
  ): Response {
    return ApiResponse.success(res, data, message, 201);
  }

  public static error(
    res: Response,
    error: string | Record<string, unknown>,
    statusCode = 400,
    message = 'Request failed'
  ): Response {
    const payload: ApiResponsePayload = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
    };
    return res.status(statusCode).json(payload);
  }
}
