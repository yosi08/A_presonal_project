import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

export const investmentService = {
  async addInvestment(userNumber: string, amount: number) {
    // userNumber 존재 확인
    const user = await prisma.user.findUnique({ where: { userNumber } });
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');

    const investment = await prisma.investment.create({ data: { userNumber, amount } });
    return investment;
  },

  async getInvestmentList() {
    return prisma.investment.findMany({
      include: { user: { select: { userName: true, userEmail: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  async batchUpdateInvestments(investments: Array<{ userNumber: string; amount: number }>) {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    await Promise.all(
      investments.map(async ({ userNumber, amount }) => {
        try {
          await prisma.investment.upsert({
            where: { id: (await prisma.investment.findFirst({ where: { userNumber } }))?.id ?? -1 },
            update: { amount },
            create: { userNumber, amount },
          });
          successCount++;
        } catch (err) {
          failureCount++;
          errors.push(`${userNumber}: 업데이트 실패`);
        }
      }),
    );

    return { successCount, failureCount, errors };
  },
};
