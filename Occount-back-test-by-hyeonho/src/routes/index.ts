import { Router } from 'express';
import authRoutes from './auth.routes';
import accountRoutes from './account.routes';
import verifyRoutes from './verify.routes';
import transactionRoutes from './transaction.routes';
import itemRoutes from './item.routes';
import investmentRoutes from './investment.routes';
import inventoryRoutes from './inventory.routes';
import noticeRoutes from './notice.routes';
import inquiryRoutes from './inquiry.routes';
import pgRoutes from './pg.routes';
import receiptRoutes from './receipt.routes';
import tossRoutes from './toss.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/account', accountRoutes);
router.use('/verify', verifyRoutes);
router.use('/transaction', transactionRoutes);
router.use('/item', itemRoutes);
router.use('/investment', investmentRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/notices', noticeRoutes);
router.use('/inquiry', inquiryRoutes);
router.use('/pg', pgRoutes);
router.use('/receipt', receiptRoutes);
router.use('/toss', tossRoutes);

export default router;
