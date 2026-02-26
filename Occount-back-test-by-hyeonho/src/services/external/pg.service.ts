// =============================================
// External Service: Payment Gateway (Mock Implementation)
// =============================================

export interface PaymentInfo {
  paymentId: string;
  amount: number;
  status: string;
}

export interface RefundInfo {
  refundId: string;
  success: boolean;
}

export interface IPGService {
  confirmPayment(paymentId: string): Promise<PaymentInfo>;
  refundPayment(paymentId: string, reason: string): Promise<RefundInfo>;
  getPaymentInfo(paymentId: string): Promise<PaymentInfo | null>;
}

/**
 * Mock PG 결제 서비스
 * 실제 환경에서는 KakaoPay, Toss Payments 등으로 교체
 */
export class MockPGService implements IPGService {
  async confirmPayment(paymentId: string): Promise<PaymentInfo> {
    console.log(`[Mock PG] 결제 확인: ${paymentId}`);
    return { paymentId, amount: 10000, status: 'COMPLETED' };
  }

  async refundPayment(paymentId: string, reason: string): Promise<RefundInfo> {
    console.log(`[Mock PG] 환불 요청: ${paymentId}, 사유: ${reason}`);
    return { refundId: `refund_${Date.now()}`, success: true };
  }

  async getPaymentInfo(paymentId: string): Promise<PaymentInfo | null> {
    console.log(`[Mock PG] 결제 정보 조회: ${paymentId}`);
    return { paymentId, amount: 10000, status: 'COMPLETED' };
  }
}

export const pgExternalService: IPGService = new MockPGService();
