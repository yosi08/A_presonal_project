import { Request, Response, NextFunction } from 'express';
import { pgService } from '../services/pg.service';
import { sendSuccess } from '../utils/response';

export const pgController = {
  confirmPayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId } = req.body;
      const userId = req.user!.userId;
      const result = await pgService.confirmPayment(paymentId, userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  getPaymentById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payment = await pgService.getPaymentById(String(req.params.paymentId));
      sendSuccess(res, payment);
    } catch (err) { next(err); }
  },

  refundPayment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { paymentId, reason } = req.body;
      const result = await pgService.refundPayment(paymentId, reason);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
};
