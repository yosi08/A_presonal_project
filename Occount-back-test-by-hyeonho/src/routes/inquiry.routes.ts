import { Router } from 'express';
import { inquiryController } from '../controllers/inquiry.controller';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createInquirySchema } from '../validators/inquiry.validator';

const router = Router();
router.use(authenticateToken);

router.post('/new', validate(createInquirySchema), inquiryController.createInquiry);
router.get('/list', inquiryController.getInquiryList);

export default router;
