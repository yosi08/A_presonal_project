import prisma from '../lib/prisma';

export const transactionRepository = {
  // ---- ChargeLog ----
  async findChargeLogsByUserCode(userCode: string) {
    return prisma.chargeLog.findMany({
      where: { userCode },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAllChargeLogs() {
    return prisma.chargeLog.findMany({
      include: { user: { select: { userName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createChargeLog(data: {
    userCode: string;
    chargedPoint: number;
    beforePoint: number;
    afterPoint: number;
    managedEmail?: string;
    reason?: string;
  }) {
    return prisma.chargeLog.create({ data });
  },

  // ---- PayLog ----
  async findPayLogsByUserCode(userCode: string) {
    return prisma.payLog.findMany({
      where: { userCode },
      orderBy: { createdAt: 'desc' },
    });
  },

  async findAllPayLogs() {
    return prisma.payLog.findMany({
      include: { user: { select: { userName: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async createPayLog(data: {
    userCode: string;
    payedPoint: number;
    beforePoint: number;
    afterPoint: number;
    eventType: string;
  }) {
    return prisma.payLog.create({ data });
  },

  // ---- User Point (atomic update) ----
  async incrementUserPoint(userCode: string, delta: number) {
    return prisma.user.update({
      where: { userCode },
      data: { userPoint: { increment: delta } },
    });
  },

  async decrementUserPoint(userCode: string, delta: number) {
    return prisma.user.update({
      where: { userCode },
      data: { userPoint: { decrement: delta } },
    });
  },
};
