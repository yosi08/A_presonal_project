import { Request, Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { sendSuccess } from '../utils/response';
import { ChargeInput, MultiChargeInput, PayInput, BarcodeInput } from '../validators/transaction.validator';

export const transactionController = {
  getUserByBarcode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userCode } = req.body as BarcodeInput;
      const result = await transactionService.getUserByBarcode(userCode);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  getChargeLogsByCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await transactionService.getChargeLogsByCode(String(req.params.userCode));
      sendSuccess(res, logs);
    } catch (err) { next(err); }
  },

  getPayLogsByCode: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await transactionService.getPayLogsByCode(String(req.params.userCode));
      sendSuccess(res, logs);
    } catch (err) { next(err); }
  },

  getMyChargeLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await transactionService.getMyChargeLogs(req.user!.userCode);
      sendSuccess(res, logs);
    } catch (err) { next(err); }
  },

  getMyPayLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const logs = await transactionService.getMyPayLogs(req.user!.userCode);
      sendSuccess(res, logs);
    } catch (err) { next(err); }
  },

  getAllChargeLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chargeLogList = await transactionService.getAllChargeLogs();
      sendSuccess(res, { chargeLogList });
    } catch (err) { next(err); }
  },

  getAllPayLogs: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payLogList = await transactionService.getAllPayLogs();
      sendSuccess(res, { payLogList });
    } catch (err) { next(err); }
  },

  chargePoint: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userCode, chargedPoint } = req.body as ChargeInput;
      const result = await transactionService.chargePoint(userCode, chargedPoint, req.user?.email);
      sendSuccess(res, result, '포인트 충전이 완료되었습니다.');
    } catch (err) { next(err); }
  },

  multiChargePoints: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userCodeList, chargedPoint, reason } = req.body as MultiChargeInput;
      const result = await transactionService.multiChargePoints(userCodeList, chargedPoint, reason);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },

  payPoint: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userCode, eventType, payedPoint } = req.body as PayInput;
      const result = await transactionService.payPoint(userCode, eventType, payedPoint);
      sendSuccess(res, result, '결제가 완료되었습니다.');
    } catch (err) { next(err); }
  },
};
