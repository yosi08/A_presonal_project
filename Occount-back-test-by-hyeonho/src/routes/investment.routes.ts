import { Router } from 'express';
import { investmentController } from '../controllers/investment.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.post('/', authorizeRoles('ADMIN'), investmentController.addInvestment);
router.get('/list', authorizeRoles('ADMIN', 'COOPERATIVE'), investmentController.getInvestmentList);
router.put('/batch', authorizeRoles('ADMIN'), investmentController.batchUpdateInvestments);

export default router;
