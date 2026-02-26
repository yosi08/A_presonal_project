import { Request, Response, NextFunction } from 'express';
import { itemService } from '../services/item.service';
import { sendSuccess } from '../utils/response';

export const itemController = {
  getAllItems: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await itemService.getAllItems();
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
};
