import { z } from 'zod';

export const createNoticeSchema = z.object({
  title: z.string().min(1, '제목은 필수입니다.'),
  content: z.string().min(1, '내용은 필수입니다.'),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('LOW'),
});

export type CreateNoticeInput = z.infer<typeof createNoticeSchema>;
