import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../shared/middleware/validation.middleware';
import { authenticateJwt } from '../../shared/middleware/auth.middleware';
import { registerSchema, loginSchema } from './auth.validation';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);

// Protected routes
router.get('/me', authenticateJwt, AuthController.me);

export { router as authRouter };
