// =============================================
// External Service: Toss API (Mock Implementation)
// =============================================

export interface TossSyncResult {
  updatedItems: number;
  totalItems: number;
}

export interface ITossService {
  syncProducts(): Promise<TossSyncResult>;
}

/**
 * Mock Toss 연동 서비스
 * 실제 환경에서는 Toss API Key를 사용하여 상품 정보 동기화
 */
export class MockTossService implements ITossService {
  async syncProducts(): Promise<TossSyncResult> {
    console.log('[Mock Toss] 상품 정보 동기화 요청');
    // 실제 환경에서는 Toss API를 호출하여 상품 정보를 DB에 반영
    return { updatedItems: 0, totalItems: 0 };
  }
}

export const tossExternalService: ITossService = new MockTossService();
