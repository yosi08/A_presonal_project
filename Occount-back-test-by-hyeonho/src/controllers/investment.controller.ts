import { Request, Response, NextFunction } from 'express';
import { investmentService } from '../services/investment.service';
import { sendSuccess } from '../utils/response';

export const investmentController = {
  addInvestment: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userNumber, amount } = req.body;
      const result = await investmentService.addInvestment(userNumber, amount);
      sendSuccess(res, result, '출자금이 등록되었습니다.', 201);
    } catch (err) { next(err); }
  },

  getInvestmentList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const investments = await investmentService.getInvestmentList();
      sendSuccess(res, investments);
    } catch (err) { next(err); }
  },

  batchUpdateInvestments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { investments } = req.body;
      const result = await investmentService.batchUpdateInvestments(investments);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
};
