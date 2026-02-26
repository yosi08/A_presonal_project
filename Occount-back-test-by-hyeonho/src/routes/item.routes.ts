import { Router } from 'express';
import { itemController } from '../controllers/item.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();
router.use(authenticateToken);
router.get('/', itemController.getAllItems);

export default router;
