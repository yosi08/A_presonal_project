import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository';
import { emailService } from './external/email.service';
import { AppError } from '../utils/AppError';
import { RegisterInput } from '../validators/auth.validator';
import { Role, UserType } from '@prisma/client';

export const authService = {
  async register(data: RegisterInput) {
    // 중복 이메일 확인
    const existing = await userRepository.findByEmail(data.userEmail);
    if (existing) {
      throw AppError.conflict('이미 사용 중인 이메일입니다.', 'DUPLICATE_EMAIL');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(data.userPassword, 12);
    const hashedPin = data.userPin ? await bcrypt.hash(data.userPin, 12) : undefined;

    const user = await userRepository.create({
      ...data,
      userPassword: hashedPassword,
      userPin: hashedPin,
      roles: (data.roles as Role) ?? Role.STUDENT,
      userType: (data.userType as UserType) ?? UserType.STUDENT,
    });

    // 비밀번호 제외하고 반환
    const { userPassword: _, userPin: __, ...safeUser } = user;
    return safeUser;
  },

  async login(email: string, password: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw AppError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.', 'INVALID_PASSWORD');
    }

    const isPasswordValid = await bcrypt.compare(password, user.userPassword);
    if (!isPasswordValid) {
      throw AppError.unauthorized('이메일 또는 비밀번호가 올바르지 않습니다.', 'INVALID_PASSWORD');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET이 설정되지 않았습니다.');

    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as `${number}${'s' | 'm' | 'h' | 'd' | 'w' | 'y'}`;
    const token = jwt.sign(
      {
        userId: user.id,
        userCode: user.userCode,
        email: user.userEmail,
        roles: user.roles,
      },
      secret,
      { expiresIn },
    );

    return { token, user: { ...user, userPassword: undefined, userPin: undefined } };
  },

  async sendPasswordResetEmail(userEmail: string, userName: string) {
    const user = await userRepository.findByEmail(userEmail);
    if (!user) {
      // 보안상 존재 여부를 노출하지 않음
      return { success: true, message: '비밀번호 재설정 이메일을 발송했습니다.' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1시간

    await userRepository.createResetToken(user.id, token, expiresAt);
    await emailService.sendPasswordResetEmail(userEmail, userName, token);

    return { success: true, message: '비밀번호 재설정 이메일을 발송했습니다.' };
  },

  async changePassword(resetToken: string, newPassword: string) {
    const tokenRecord = await userRepository.findResetToken(resetToken);
    if (!tokenRecord || tokenRecord.used) {
      throw AppError.unauthorized('유효하지 않은 토큰입니다.', 'INVALID_TOKEN');
    }
    if (tokenRecord.expiresAt < new Date()) {
      throw AppError.unauthorized('토큰이 만료되었습니다.', 'TOKEN_EXPIRED');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await userRepository.updateById(tokenRecord.userId, { userPassword: hashedPassword });
    await userRepository.markTokenUsed(resetToken);

    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
  },
};
