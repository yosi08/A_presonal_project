import { z } from 'zod';

export const createInquirySchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.'),
  content: z.string().min(1, '내용은 필수입니다.'),
  category: z.enum(['GENERAL', 'TECHNICAL', 'PAYMENT', 'OTHER']),
});

export type CreateInquiryInput = z.infer<typeof createInquirySchema>;
