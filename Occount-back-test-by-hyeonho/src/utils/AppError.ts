// =============================================
// 비즈니스 로직 커스텀 에러 클래스
// =============================================

export type BusinessErrorCode =
  | 'USER_NOT_FOUND'
  | 'STUDENT_NOT_FOUND'
  | 'INVALID_PASSWORD'
  | 'INVALID_PIN'
  | 'DUPLICATE_USER'
  | 'DUPLICATE_EMAIL'
  | 'INSUFFICIENT_POINTS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'PAYMENT_NOT_FOUND'
  | 'INQUIRY_LIMIT_EXCEEDED'
  | 'ITEM_NOT_FOUND'
  | 'NOTICE_NOT_FOUND'
  | 'INVESTMENT_NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'VALIDATION_ERROR';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly errorCode: BusinessErrorCode | string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: BusinessErrorCode | string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static notFound(resource: string, code: BusinessErrorCode = 'USER_NOT_FOUND'): AppError {
    return new AppError(`${resource}을(를) 찾을 수 없습니다.`, 404, code);
  }

  static unauthorized(message = '인증이 필요합니다.', code: BusinessErrorCode = 'UNAUTHORIZED'): AppError {
    return new AppError(message, 401, code);
  }

  static forbidden(message = '접근 권한이 없습니다.', code: BusinessErrorCode = 'FORBIDDEN'): AppError {
    return new AppError(message, 403, code);
  }

  static badRequest(message: string, code: BusinessErrorCode | string = 'VALIDATION_ERROR'): AppError {
    return new AppError(message, 400, code);
  }

  static conflict(message: string, code: BusinessErrorCode | string = 'DUPLICATE_USER'): AppError {
    return new AppError(message, 409, code);
  }
}
