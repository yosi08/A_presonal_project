import prisma from '../lib/prisma';
import { AppError } from '../utils/AppError';

export const itemService = {
  async getAllItems() {
    const items = await prisma.item.findMany({
      where: { isActive: true },
      orderBy: { itemCategory: 'asc' },
    });
    return {
      itemList: items.map((i) => ({
        itemCode: i.itemCode,
        itemName: i.itemName,
        itemPrice: i.itemPrice,
        itemCategory: i.itemCategory,
        itemDescription: i.itemDescription,
      }))
    };
  },
};
