import { Request, Response, NextFunction } from 'express';
import { verifyService } from '../services/verify.service';
import { sendSuccess } from '../utils/response';

export const verifyController = {
  sendMail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userEmail, userName } = req.body;
      const result = await verifyService.sendPasswordResetMail(userEmail, userName);
      sendSuccess(res, undefined, result.message);
    } catch (err) { next(err); }
  },

  verifyIdentity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { identityVerificationId } = req.body;
      const result = await verifyService.verifyIdentity(identityVerificationId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
};
