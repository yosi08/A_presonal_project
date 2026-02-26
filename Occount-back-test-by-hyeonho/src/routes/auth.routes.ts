import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { registerSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

// POST /auth/register
router.post('/register', validate(registerSchema), authController.register);

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/pwChange/:resetToken
router.post('/pwChange/:resetToken', validate(changePasswordSchema), authController.changePassword);

export default router;
