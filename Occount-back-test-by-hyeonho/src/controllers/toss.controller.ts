import { Request, Response, NextFunction } from 'express';
import { tossService } from '../services/toss.service';
import { sendSuccess } from '../utils/response';

export const tossController = {
  syncProducts: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await tossService.syncProducts();
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
};
