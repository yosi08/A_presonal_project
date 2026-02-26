import { Request, Response, NextFunction } from 'express';
import { inquiryService } from '../services/inquiry.service';
import { sendSuccess } from '../utils/response';
import { CreateInquiryInput } from '../validators/inquiry.validator';
import { InquiryCategory } from '@prisma/client';

export const inquiryController = {
  createInquiry: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, category } = req.body as CreateInquiryInput;
      const userId = req.user!.userId;
      const result = await inquiryService.createInquiry(userId, title, content, category as InquiryCategory);
      sendSuccess(res, result, result.message, 201);
    } catch (err) { next(err); }
  },

  getInquiryList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // STUDENT인 경우 본인 문의만, COOPERATIVE/ADMIN은 전체 조회
      const userId = req.user!.roles === 'STUDENT' ? req.user!.userId : undefined;
      const result = await inquiryService.getInquiryList(userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  },
};
