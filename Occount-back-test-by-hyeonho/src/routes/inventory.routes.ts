import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);

router.get('/', authorizeRoles('ADMIN', 'COOPERATIVE'), inventoryController.getInventoryByDateRange);
router.get('/byday/:stdDate', authorizeRoles('ADMIN', 'COOPERATIVE'), inventoryController.getInventoryByDay);
router.post('/snapshot', authorizeRoles('ADMIN', 'COOPERATIVE'), inventoryController.createSnapshot);

export default router;
