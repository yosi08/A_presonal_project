import { z } from 'zod';

export const registerSchema = z.object({
  userNumber: z.string().min(1, '사용자 번호는 필수입니다.'),
  userCode: z.string().min(1, '사용자 코드는 필수입니다.'),
  userCiNumber: z.string().optional(),
  userName: z.string().min(1, '사용자 이름은 필수입니다.'),
  userAddress: z.string().optional(),
  userPhone: z.string().optional(),
  userEmail: z.string().email('올바른 이메일 형식이 아닙니다.'),
  userPassword: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
  userPin: z.string().optional(),
  userFingerPrint: z.string().optional(),
  roles: z.enum(['STUDENT', 'ADMIN', 'COOPERATIVE']).optional(),
  userType: z.enum(['STUDENT', 'GENERAL']).optional(),
});

export const changePasswordSchema = z.object({
  newPassword: z.string().min(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
});

export const updateUserSchema = z.object({
  userCode: z.string().optional(),
  userCiNumber: z.string().optional(),
  userName: z.string().optional(),
  userAddress: z.string().optional(),
  userPhone: z.string().optional(),
  userEmail: z.string().email().optional(),
  userPassword: z.string().optional(),
  userPin: z.string().optional(),
  roles: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  newPin: z.string().optional(),
  userBirthDay: z.string().optional(),
  userFingerPrint: z.string().optional(),
  securityUpdate: z.boolean().optional(),
  temporaryToken: z.string().optional(),
});

export const batchUpdateSchema = z.object({
  userNumberList: z.array(z.string()).min(1, '수정할 사용자 목록이 필요합니다.'),
  userUpdateRequest: updateUserSchema,
});

export const sendEmailSchema = z.object({
  userEmail: z.string().email('올바른 이메일 형식이 아닙니다.'),
  userName: z.string().min(1, '사용자 이름은 필수입니다.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type BatchUpdateInput = z.infer<typeof batchUpdateSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
