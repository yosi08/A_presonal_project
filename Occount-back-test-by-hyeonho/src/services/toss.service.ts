import prisma from '../lib/prisma';
import { tossExternalService } from './external/toss.service';

export const tossService = {
  async syncProducts() {
    const totalItems = await prisma.item.count();
    const result = await tossExternalService.syncProducts();
    return {
      success: true,
      message: '상품 정보가 업데이트되었습니다.',
      data: { updatedItems: result.updatedItems, totalItems },
    };
  },
};
