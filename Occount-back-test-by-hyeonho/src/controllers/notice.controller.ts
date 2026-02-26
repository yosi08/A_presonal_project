import { Request, Response, NextFunction } from 'express';
import { noticeService } from '../services/notice.service';
import { sendSuccess } from '../utils/response';
import { CreateNoticeInput } from '../validators/notice.validator';
import { NoticeImportance } from '@prisma/client';

export const noticeController = {
  getAllNotices: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notices = await noticeService.getAllNotices();
      sendSuccess(res, notices);
    } catch (err) { next(err); }
  },

  getNoticeById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notice = await noticeService.getNoticeById(Number(req.params.id));
      sendSuccess(res, notice);
    } catch (err) { next(err); }
  },

  createNotice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, importance } = req.body as CreateNoticeInput;
      const notice = await noticeService.createNotice(title, content, importance as NoticeImportance);
      sendSuccess(res, notice, '공지사항이 등록되었습니다.', 201);
    } catch (err) { next(err); }
  },

  updateNotice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, content, importance } = req.body as CreateNoticeInput;
      const notice = await noticeService.updateNotice(Number(req.params.id), title, content, importance as NoticeImportance);
      sendSuccess(res, notice, '공지사항이 수정되었습니다.');
    } catch (err) { next(err); }
  },

  deleteNotice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await noticeService.deleteNotice(Number(req.params.id));
      sendSuccess(res, undefined, '공지사항이 삭제되었습니다.');
    } catch (err) { next(err); }
  },
};
