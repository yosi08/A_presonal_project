import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { chargeSchema, multiChargeSchema, paySchema, barcodeSchema } from '../validators/transaction.validator';

const router = Router();

// POST /transaction/barcode (인증 불필요 - 현장 단말에서 사용)
router.post('/barcode', validate(barcodeSchema), transactionController.getUserByBarcode);

// 인증 필요 라우트
router.use(authenticateToken);

// GET /transaction/chargelog - 본인 (STUDENT)
router.get('/chargelog', transactionController.getMyChargeLogs);

// GET /transaction/paylog - 본인 (STUDENT)
router.get('/paylog', transactionController.getMyPayLogs);

// GET /transaction/admin/chargelog
router.get('/admin/chargelog', authorizeRoles('ADMIN', 'COOPERATIVE'), transactionController.getAllChargeLogs);

// GET /transaction/admin/paylog
router.get('/admin/paylog', authorizeRoles('ADMIN', 'COOPERATIVE'), transactionController.getAllPayLogs);

// GET /transaction/chargelog/:userCode
router.get('/chargelog/:userCode', authorizeRoles('ADMIN', 'COOPERATIVE'), transactionController.getChargeLogsByCode);

// GET /transaction/paylog/:userCode
router.get('/paylog/:userCode', authorizeRoles('ADMIN', 'COOPERATIVE'), transactionController.getPayLogsByCode);

// POST /transaction/charge
router.post('/charge', authorizeRoles('ADMIN', 'COOPERATIVE'), validate(chargeSchema), transactionController.chargePoint);

// POST /transaction/charges
router.post('/charges', authorizeRoles('ADMIN', 'COOPERATIVE'), validate(multiChargeSchema), transactionController.multiChargePoints);

// POST /transaction/pay
router.post('/pay', authorizeRoles('ADMIN', 'COOPERATIVE'), validate(paySchema), transactionController.payPoint);

export default router;
