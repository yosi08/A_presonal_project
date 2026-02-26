import { Router } from 'express';
import { accountController } from '../controllers/account.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { registerSchema, updateUserSchema, batchUpdateSchema } from '../validators/auth.validator';

const router = Router();

// 모든 account 라우트는 인증 필요
router.use(authenticateToken);

// GET /account/user/list
router.get('/user/list', authorizeRoles('ADMIN', 'COOPERATIVE'), accountController.getUserList);

// GET /account/user/info - :userCode보다 먼저 등록
router.get('/user/info', accountController.getMyInfo);

// GET /account/user/:userCode
router.get('/user/:userCode', authorizeRoles('ADMIN', 'COOPERATIVE'), accountController.getUserByCode);

// POST /account/user/
router.post('/user', authorizeRoles('ADMIN'), validate(registerSchema), accountController.addUser);

// PUT /account/user/ (본인)
router.put('/user', validate(updateUserSchema), accountController.updateMyInfo);

// PUT /account/user/update/batch
router.put('/user/update/batch', authorizeRoles('ADMIN'), validate(batchUpdateSchema), accountController.batchUpdateUsers);

// PUT /account/user/:userNumber (관리자)
router.put('/user/:userNumber', authorizeRoles('ADMIN'), validate(updateUserSchema), accountController.updateUserByAdmin);

// DELETE /account/user/batch
router.delete('/user/batch', authorizeRoles('ADMIN'), accountController.batchDeleteUsers);

// GET /account/student/list
router.get('/student/list', authorizeRoles('ADMIN', 'COOPERATIVE'), accountController.getStudentList);

// GET /account/student/email/:stuEmail - :stuCode보다 먼저 등록
router.get('/student/email/:stuEmail', authorizeRoles('ADMIN', 'COOPERATIVE'), accountController.getStudentByEmail);

// GET /account/student/:stuCode
router.get('/student/:stuCode', authorizeRoles('ADMIN', 'COOPERATIVE'), accountController.getStudentByStuCode);

export default router;
