import { Request, Response, NextFunction } from 'express';
import { accountService } from '../services/account.service';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { RegisterInput, UpdateUserInput, BatchUpdateInput } from '../validators/auth.validator';

export const accountController = {
  getUserList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userList = await accountService.getAllUsers();
      sendSuccess(res, { userList });
    } catch (err) { next(err); }
  },

  getUserByCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await accountService.getUserByCode(String(req.params.userCode));
      sendSuccess(res, user);
    } catch (err) { next(err); }
  },

  getMyInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const info = await accountService.getMyInfo(userId);
      sendSuccess(res, info);
    } catch (err) { next(err); }
  },

  addUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RegisterInput;
      const user = await authService.register(data);
      sendSuccess(res, user, '사용자가 추가되었습니다.', 201);
    } catch (err) { next(err); }
  },

  updateMyInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userNumber = req.body.userCode; // body에 userCode 포함
      const data = req.body as UpdateUserInput;
      const updated = await accountService.updateMyInfo(userNumber, data);
      sendSuccess(res, updated, '정보가 수정되었습니다.');
    } catch (err) { next(err); }
  },

  updateUserByAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userNumber = String(req.params.userNumber);
      const data = req.body as UpdateUserInput;
      const updated = await accountService.updateUserByAdmin(userNumber, data);
      sendSuccess(res, updated, '사용자 정보가 수정되었습니다.');
    } catch (err) { next(err); }
  },

  batchUpdateUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userNumberList, userUpdateRequest } = req.body as BatchUpdateInput;
      const result = await accountService.batchUpdate(userNumberList, userUpdateRequest);
      sendSuccess(res, result, '일괄 수정이 완료되었습니다.');
    } catch (err) { next(err); }
  },

  batchDeleteUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userNumbers = req.body as string[];
      await accountService.batchDelete(userNumbers);
      sendSuccess(res, undefined, '일괄 삭제가 완료되었습니다.');
    } catch (err) { next(err); }
  },

  getStudentList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const studentList = await accountService.getAllStudents();
      sendSuccess(res, { studentList });
    } catch (err) { next(err); }
  },

  getStudentByStuCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await accountService.getStudentByStuCode(String(req.params.stuCode));
      sendSuccess(res, student);
    } catch (err) { next(err); }
  },

  getStudentByEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const student = await accountService.getStudentByEmail(String(req.params.stuEmail));
      sendSuccess(res, student);
    } catch (err) { next(err); }
  },
};
