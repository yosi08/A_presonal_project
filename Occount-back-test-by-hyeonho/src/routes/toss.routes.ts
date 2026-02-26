import { Router } from 'express';
import { tossController } from '../controllers/toss.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.use(authorizeRoles('ADMIN', 'COOPERATIVE'));

router.post('/', tossController.syncProducts);

export default router;
