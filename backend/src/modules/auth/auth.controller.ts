import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ApiResponse } from '../../shared/utils/api-response';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      ApiResponse.created(res, result, 'Registration successful');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        ApiResponse.error(res, error.message, 409, 'Conflict');
        return;
      }
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      ApiResponse.success(res, result, 'Login successful');
    } catch (error: any) {
      if (error.message.includes('Invalid') || error.message.includes('deactivated')) {
        ApiResponse.error(res, error.message, 401, 'Unauthorized');
        return;
      }
      next(error);
    }
  }

  public static async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        ApiResponse.error(res, 'Authentication required', 401, 'Unauthorized');
        return;
      }
      const user = await AuthService.getCurrentUser(req.user.id);
      ApiResponse.success(res, user, 'User details retrieved');
    } catch (error) {
      next(error);
    }
  }

  public static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.forgotPassword(req.body);
      ApiResponse.success(res, result, 'Password reset instructions dispatched');
    } catch (error: any) {
      next(error);
    }
  }

  public static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await AuthService.resetPassword(req.body);
      ApiResponse.success(res, result, 'Password successfully reset');
    } catch (error: any) {
      if (
        error.message.includes('Invalid') ||
        error.message.includes('expired') ||
        error.message.includes('used') ||
        error.message.includes('not found')
      ) {
        ApiResponse.error(res, error.message, 400, 'Bad Request');
        return;
      }
      next(error);
    }
  }
}
