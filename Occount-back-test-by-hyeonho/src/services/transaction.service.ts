import prisma from '../lib/prisma';
import { transactionRepository } from '../repositories/transaction.repository';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';

export const transactionService = {
  async getUserByBarcode(userCode: string) {
    const user = await userRepository.findByUserCode(userCode);
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
    return { userName: user.userName, userPoint: user.userPoint };
  },

  async getChargeLogsByCode(userCode: string) {
    const user = await userRepository.findByUserCode(userCode);
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
    return transactionRepository.findChargeLogsByUserCode(userCode);
  },

  async getPayLogsByCode(userCode: string) {
    const user = await userRepository.findByUserCode(userCode);
    if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
    return transactionRepository.findPayLogsByUserCode(userCode);
  },

  async getMyChargeLogs(userCode: string) {
    return transactionRepository.findChargeLogsByUserCode(userCode);
  },

  async getMyPayLogs(userCode: string) {
    return transactionRepository.findPayLogsByUserCode(userCode);
  },

  async getAllChargeLogs() {
    const logs = await transactionRepository.findAllChargeLogs();
    return logs.map((log) => ({
      id: log.id,
      userCode: log.userCode,
      userName: log.user.userName,
      chargedPoint: log.chargedPoint,
      beforePoint: log.beforePoint,
      afterPoint: log.afterPoint,
      managedEmail: log.managedEmail,
      createdAt: log.createdAt,
    }));
  },

  async getAllPayLogs() {
    const logs = await transactionRepository.findAllPayLogs();
    return logs.map((log) => ({
      id: log.id,
      userCode: log.userCode,
      userName: log.user.userName,
      payedPoint: log.payedPoint,
      beforePoint: log.beforePoint,
      afterPoint: log.afterPoint,
      eventType: log.eventType,
      createdAt: log.createdAt,
    }));
  },

  /**
   * 포인트 충전 - Prisma 트랜잭션으로 원자적 처리
   */
  async chargePoint(userCode: string, chargedPoint: number, managedEmail?: string) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { userCode } });
      if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');

      const beforePoint = user.userPoint;
      const afterPoint = beforePoint + chargedPoint;

      await tx.user.update({ where: { userCode }, data: { userPoint: afterPoint } });
      await tx.chargeLog.create({
        data: { userCode, chargedPoint, beforePoint, afterPoint, managedEmail },
      });

      return {
        userCode,
        userName: user.userName,
        beforePoint,
        afterPoint,
        chargedPoint,
      };
    });
  },

  async multiChargePoints(userCodeList: string[], chargedPoint: number, reason?: string) {
    const results = await Promise.all(
      userCodeList.map((userCode) => this.chargePoint(userCode, chargedPoint)),
    );
    return { chargesList: results };
  },

  /**
   * 포인트 결제 - Prisma 트랜잭션으로 원자적 처리
   */
  async payPoint(userCode: string, eventType: string, payedPoint: number) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { userCode } });
      if (!user) throw new AppError('사용자를 찾을 수 없습니다.', 404, 'USER_NOT_FOUND');
      if (user.userPoint < payedPoint) {
        throw new AppError('포인트가 부족합니다.', 400, 'INSUFFICIENT_POINTS');
      }

      const beforePoint = user.userPoint;
      const afterPoint = beforePoint - payedPoint;

      await tx.user.update({ where: { userCode }, data: { userPoint: afterPoint } });
      await tx.payLog.create({
        data: { userCode, payedPoint, beforePoint, afterPoint, eventType },
      });

      return {
        userCode,
        userName: user.userName,
        beforePoint,
        afterPoint,
        payedPoint,
      };
    });
  },
};
