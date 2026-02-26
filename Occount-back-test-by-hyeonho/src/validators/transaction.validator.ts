import { z } from 'zod';

export const chargeSchema = z.object({
  userCode: z.string().min(1, '사용자 코드는 필수입니다.'),
  chargedPoint: z.number().int().positive('충전 포인트는 양의 정수여야 합니다.'),
});

export const multiChargeSchema = z.object({
  userCodeList: z.array(z.string()).min(1, '사용자 코드 목록이 필요합니다.'),
  chargedPoint: z.number().int().positive('충전 포인트는 양의 정수여야 합니다.'),
  reason: z.string().optional(),
});

export const paySchema = z.object({
  userCode: z.string().min(1, '사용자 코드는 필수입니다.'),
  eventType: z.string().min(1, '결제 이벤트 유형은 필수입니다.'),
  payedPoint: z.number().int().positive('결제 포인트는 양의 정수여야 합니다.'),
});

export const barcodeSchema = z.object({
  userCode: z.string().min(1, '사용자 코드는 필수입니다.'),
});

export type ChargeInput = z.infer<typeof chargeSchema>;
export type MultiChargeInput = z.infer<typeof multiChargeSchema>;
export type PayInput = z.infer<typeof paySchema>;
export type BarcodeInput = z.infer<typeof barcodeSchema>;
