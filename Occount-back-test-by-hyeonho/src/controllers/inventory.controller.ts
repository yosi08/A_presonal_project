import { Request, Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { sendSuccess } from '../utils/response';
import { AppError } from '../utils/AppError';

export const inventoryController = {
  getInventoryByDateRange: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, endDate } = req.query as { startDate: string; endDate: string };
      if (!startDate || !endDate) throw AppError.badRequest('startDate와 endDate는 필수입니다.');
      const result = await inventoryService.getInventoryByDateRange(startDate, endDate);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  getInventoryByDay: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stdDate = String(req.params.stdDate);
      const result = await inventoryService.getInventorySnapshotByDate(stdDate);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  createSnapshot: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { items } = req.body;
      const result = await inventoryService.createSnapshot(items);
      sendSuccess(res, result, '재고 스냅샷이 생성되었습니다.', 201);
    } catch (err) { next(err); }
  },
};
