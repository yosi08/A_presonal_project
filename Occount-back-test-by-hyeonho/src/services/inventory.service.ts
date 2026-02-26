import prisma from '../lib/prisma';

export const inventoryService = {
  async getInventoryByDateRange(startDate: string, endDate: string) {
    const inventories = await prisma.inventory.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      include: { item: { select: { itemName: true } } },
      orderBy: { date: 'asc' },
    });
    return {
      inventoryList: inventories.map((inv) => ({
        id: inv.id,
        itemCode: inv.itemCode,
        itemName: inv.item.itemName,
        itemQuantity: inv.itemQuantity,
        date: inv.date,
      })),
    };
  },

  async getInventorySnapshotByDate(stdDate: string) {
    const snapshots = await prisma.inventorySnapshot.findMany({
      where: { stdDate: new Date(stdDate) },
      include: { item: { select: { itemName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return {
      snapshotList: snapshots.map((s) => ({
        itemCode: s.itemCode,
        itemName: s.item.itemName,
        beforeQuantity: s.beforeQuantity,
        afterQuantity: s.afterQuantity,
        changeQuantity: s.changeQuantity,
        reason: s.reason,
        createdAt: s.createdAt,
      })),
    };
  },

  async createSnapshot(items: Array<{ itemCode: string; itemQuantity: number; reason?: string }>) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = await Promise.all(
      items.map(async ({ itemCode, itemQuantity, reason }) => {
        try {
          const item = await prisma.item.findUnique({ where: { itemCode } });
          if (!item) return { itemCode, itemQuantity, success: false, message: '상품을 찾을 수 없습니다.' };

          // 오늘 기존 재고 조회
          const existing = await prisma.inventory.findUnique({
            where: { itemCode_date: { itemCode, date: today } },
          });
          const beforeQuantity = existing?.itemQuantity ?? 0;
          const changeQuantity = itemQuantity - beforeQuantity;

          // 재고 upsert
          await prisma.inventory.upsert({
            where: { itemCode_date: { itemCode, date: today } },
            update: { itemQuantity },
            create: { itemCode, itemQuantity, date: today },
          });

          // 스냅샷 생성
          await prisma.inventorySnapshot.create({
            data: { itemCode, beforeQuantity, afterQuantity: itemQuantity, changeQuantity, reason, stdDate: today },
          });

          return { itemCode, itemQuantity, success: true, message: '재고 업데이트 완료' };
        } catch {
          return { itemCode, itemQuantity, success: false, message: '처리 중 오류 발생' };
        }
      }),
    );

    return { results };
  },
};
