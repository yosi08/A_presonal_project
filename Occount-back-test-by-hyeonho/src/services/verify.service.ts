import { portOneService } from './external/portone.service';
import { emailService } from './external/email.service';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../utils/AppError';
import crypto from 'crypto';

export const verifyService = {
  async sendPasswordResetMail(userEmail: string, userName: string) {
    const user = await userRepository.findByEmail(userEmail);
    // 보안상 이메일 존재 여부 노출 안 함
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1시간
      await userRepository.createResetToken(user.id, token, expiresAt);
      await emailService.sendPasswordResetEmail(userEmail, userName, token);
    }
    return { success: true, message: '비밀번호 재설정 이메일을 발송했습니다.' };
  },

  async verifyIdentity(identityVerificationId: string) {
    const result = await portOneService.verifyIdentity(identityVerificationId);
    if (!result.isVerified) {
      throw AppError.badRequest('본인인증에 실패했습니다.');
    }
    return {
      success: true,
      message: '본인인증이 완료되었습니다.',
      verificationId: result.verificationId,
      name: result.name,
      birth: result.birth,
      phone: result.phone,
      isVerified: result.isVerified,
    };
  },
};
