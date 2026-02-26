import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { RegisterInput, ChangePasswordInput } from '../validators/auth.validator';

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body as RegisterInput;
      const user = await authService.register(data);
      sendSuccess(res, user, '회원가입이 완료되었습니다.', 201);
    } catch (err) { next(err); }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resetToken = String(req.params.resetToken);
      const { newPassword } = req.body as ChangePasswordInput;
      const result = await authService.changePassword(resetToken, newPassword);
      sendSuccess(res, undefined, result.message);
    } catch (err) { next(err); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      sendSuccess(res, result, '로그인 성공');
    } catch (err) { next(err); }
  },
};
