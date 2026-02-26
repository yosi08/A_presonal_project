import { Router } from 'express';
import { pgController } from '../controllers/pg.controller';
import { authenticateToken } from '../middleware/auth';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const confirmSchema = z.object({ paymentId: z.string().min(1) });
const refundSchema = z.object({ paymentId: z.string().min(1), reason: z.string().min(1) });

const router = Router();
router.use(authenticateToken);

router.post('/confirm', validate(confirmSchema), pgController.confirmPayment);
router.get('/payment/:paymentId', pgController.getPaymentById);
router.post('/refund', validate(refundSchema), pgController.refundPayment);

export default router;
