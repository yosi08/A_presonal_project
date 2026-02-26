import prisma from '../lib/prisma';
import { InquiryCategory } from '@prisma/client';

export const inquiryService = {
  async createInquiry(userId: number, title: string, content: string, category: InquiryCategory) {
    await prisma.inquiry.create({
      data: { userId, inquiryTitle: title, inquiryContent: content, inquiryType: category },
    });
    return { message: '문의가 접수되었습니다.' };
  },

  async getInquiryList(userId?: number) {
    const where = userId ? { userId } : {};
    const inquiries = await prisma.inquiry.findMany({
      where,
      include: { user: { select: { userEmail: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      inquiryList: inquiries.map((inq) => ({
        id: inq.id,
        userEmail: inq.user.userEmail,
        inquiryTitle: inq.inquiryTitle,
        inquiryContent: inq.inquiryContent,
        inquiryType: inq.inquiryType,
        createdAt: inq.createdAt,
        answeredAt: inq.answeredAt,
      })),
    };
  },
};
