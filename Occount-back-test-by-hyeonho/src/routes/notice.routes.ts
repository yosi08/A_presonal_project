import { Router } from 'express';
import { noticeController } from '../controllers/notice.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createNoticeSchema } from '../validators/notice.validator';

const router = Router();

// 공지 목록/상세 조회는 인증 없이 허용
router.get('/', noticeController.getAllNotices);
router.get('/:id', noticeController.getNoticeById);

// 생성/수정/삭제는 ADMIN 전용
router.use(authenticateToken);
router.post('/', authorizeRoles('ADMIN'), validate(createNoticeSchema), noticeController.createNotice);
router.put('/:id', authorizeRoles('ADMIN'), validate(createNoticeSchema), noticeController.updateNotice);
router.delete('/:id', authorizeRoles('ADMIN'), noticeController.deleteNotice);

export default router;
