import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';
import { NoticeImportance } from '@prisma/client';

export const noticeService = {
  async getAllNotices() {
    return prisma.notice.findMany({
      where: { isActive: true },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    });
  },

  async getNoticeById(id: number) {
    const notice = await prisma.notice.findUnique({ where: { id } });
    if (!notice || !notice.isActive) throw new AppError('공지사항을 찾을 수 없습니다.', 404, 'NOTICE_NOT_FOUND');
    return notice;
  },

  async createNotice(title: string, content: string, importance: NoticeImportance) {
    return prisma.notice.create({ data: { title, content, importance } });
  },

  async updateNotice(id: number, title: string, content: string, importance: NoticeImportance) {
    await this.getNoticeById(id);
    return prisma.notice.update({ where: { id }, data: { title, content, importance } });
  },

  async deleteNotice(id: number) {
    await this.getNoticeById(id);
    return prisma.notice.update({ where: { id }, data: { isActive: false } });
  },
};
