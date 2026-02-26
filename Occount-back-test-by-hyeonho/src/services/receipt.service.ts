import prisma from '../lib/prisma';

export const receiptService = {
  async getReceiptsByDateRange(startDate: string, endDate: string) {
    const payLogs = await prisma.payLog.findMany({
      where: {
        createdAt: { gte: new Date(startDate), lte: new Date(`${endDate}T23:59:59`) },
      },
      include: { user: { select: { userName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      receiptList: payLogs.map((log) => ({
        id: log.id,
        userCode: log.userCode,
        userName: log.user.userName,
        payedPoint: log.payedPoint,
        eventType: log.eventType,
        createdAt: log.createdAt,
      })),
    };
  },

  async getStockVarianceByDateRange(startDate: string, endDate: string) {
    // 일반 결제 로그
    const payLogs = await prisma.payLog.findMany({
      where: {
        createdAt: { gte: new Date(startDate), lte: new Date(`${endDate}T23:59:59`) },
      },
      include: { user: { select: { userName: true } } },
    });

    const sumReceiptList = payLogs.map((log) => ({
      userCode: log.userCode,
      userName: log.user.userName,
      payedPoint: log.payedPoint,
      eventType: log.eventType,
      receiptType: 'NORMAL',
      createdAt: log.createdAt,
    }));

    return { sumReceiptList };
  },
};
