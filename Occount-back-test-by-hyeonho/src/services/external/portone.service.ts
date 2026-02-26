// =============================================
// External Service: PortOne 본인인증 (Mock Implementation)
// =============================================

export interface VerificationResult {
  success: boolean;
  verificationId: string;
  name: string;
  birth: string;
  phone: string;
  isVerified: boolean;
}

export interface IPortOneService {
  verifyIdentity(identityVerificationId: string): Promise<VerificationResult>;
}

/**
 * Mock PortOne 본인인증 서비스
 * 실제 환경에서는 PortOne V2 API 연동으로 교체
 */
export class MockPortOneService implements IPortOneService {
  async verifyIdentity(identityVerificationId: string): Promise<VerificationResult> {
    console.log(`[Mock PortOne] 본인인증 요청: ${identityVerificationId}`);
    // 실제 환경에서는 PortOne API 호출 후 검증 결과 반환
    return {
      success: true,
      verificationId: identityVerificationId,
      name: '홍길동',
      birth: '2000-01-01',
      phone: '010-0000-0000',
      isVerified: true,
    };
  }
}

export const portOneService: IPortOneService = new MockPortOneService();
