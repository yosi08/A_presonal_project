import prisma from '../lib/prisma';
import { pgExternalService } from './external/pg.service';
import { AppError } from '../utils/AppError';

export const pgService = {
  async confirmPayment(paymentId: string, userId: number) {
    // 1. 중복 처리 방지
    const existing = await prisma.payment.findUnique({ where: { paymentId } });
    if (existing) {
      return {
        success: true,
        message: '이미 처리된 결제입니다.',
        paymentInfo: { paymentId, amount: existing.amount, status: existing.status },
      };
    }

    // 2. PG사에 결제 확인 요청 (Mock)
    const paymentInfo = await pgExternalService.confirmPayment(paymentId);

    // 3. DB에 결제 정보 저장
    await prisma.payment.create({
      data: { paymentId, userId, amount: paymentInfo.amount, status: 'COMPLETED' },
    });

    return { success: true, message: '결제가 확인되었습니다.', paymentInfo };
  },

  async getPaymentById(paymentId: string) {
    const payment = await prisma.payment.findUnique({ where: { paymentId } });
    if (!payment) throw new AppError('결제 정보를 찾을 수 없습니다.', 404, 'PAYMENT_NOT_FOUND');
    return payment;
  },

  async refundPayment(paymentId: string, reason: string) {
    const payment = await prisma.payment.findUnique({ where: { paymentId } });
    if (!payment) throw new AppError('결제 정보를 찾을 수 없습니다.', 404, 'PAYMENT_NOT_FOUND');

    const refundResult = await pgExternalService.refundPayment(paymentId, reason);
    await prisma.payment.update({
      where: { paymentId },
      data: { status: 'REFUNDED', refundId: refundResult.refundId },
    });

    return {
      success: true,
      refundId: refundResult.refundId,
      message: '환불이 완료되었습니다.',
    };
  },
};
