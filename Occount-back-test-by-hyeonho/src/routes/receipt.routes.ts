import { Router } from 'express';
import { receiptController } from '../controllers/receipt.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'COOPERATIVE'));

router.get('/receiptcheck', receiptController.getReceiptsByDateRange);
router.get('/stockvariance', receiptController.getStockVariance);

export default router;
