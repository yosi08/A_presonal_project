import { Request, Response, NextFunction } from 'express';
import { receiptService } from '../services/receipt.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

export const receiptController = {
  getReceiptsByDateRange: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      if (!startDate || !endDate) throw AppError.badRequest('startDate와 endDate는 필수입니다.');
      const result = await receiptService.getReceiptsByDateRange(startDate, endDate);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  getStockVariance: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      if (!startDate || !endDate) throw AppError.badRequest('startDate와 endDate는 필수입니다.');
      const result = await receiptService.getStockVarianceByDateRange(startDate, endDate);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
};
