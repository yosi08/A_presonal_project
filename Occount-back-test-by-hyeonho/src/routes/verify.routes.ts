import { Router } from 'express';
import { verifyController } from '../controllers/verify.controller';
import { validate } from '../middleware/validate';
import { sendEmailSchema } from '../validators/auth.validator';
import { z } from 'zod';

const identitySchema = z.object({
  identityVerificationId: z.string().min(1, '본인인증 ID는 필수입니다.'),
});

const router = Router();

// POST /verify/send
router.post('/send', validate(sendEmailSchema), verifyController.sendMail);

// POST /verify/identity
router.post('/identity', validate(identitySchema), verifyController.verifyIdentity);

export default router;
