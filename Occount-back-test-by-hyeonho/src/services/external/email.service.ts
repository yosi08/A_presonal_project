// =============================================
// External Service: Email (Mock Implementation)
// =============================================

export interface IEmailService {
  sendPasswordResetEmail(email: string, userName: string, resetToken: string): Promise<void>;
}

/**
 * Mock 이메일 서비스
 * 실제 환경에서는 nodemailer, AWS SES, SendGrid 등으로 교체
 */
export class MockEmailService implements IEmailService {
  async sendPasswordResetEmail(email: string, userName: string, resetToken: string): Promise<void> {
    console.log('[Mock Email] 비밀번호 재설정 이메일 발송');
    console.log(`  To: ${email}`);
    console.log(`  Name: ${userName}`);
    console.log(`  Reset URL: http://localhost:3000/reset-password?token=${resetToken}`);
    // 실제 환경에서는 여기서 이메일 발송 로직 실행
  }
}

export const emailService: IEmailService = new MockEmailService();
