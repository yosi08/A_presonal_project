import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { sendError } from '../utils/response';

/**
 * 전역 에러 핸들러 미들웨어
 * 모든 에러를 일관된 API 에러 응답 형식으로 변환
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // 1. 운영 에러 (AppError) - 비즈니스 로직 에러
  if (err instanceof AppError) {
    sendError(res, err.message, err.errorCode, err.statusCode);
    return;
  }

  // 2. Prisma 에러 처리
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      sendError(res, '이미 존재하는 데이터입니다.', 'DUPLICATE_DATA', 409);
      return;
    }
    if (err.code === 'P2025') {
      // Record not found
      sendError(res, '해당 데이터를 찾을 수 없습니다.', 'NOT_FOUND', 404);
      return;
    }
    sendError(res, '데이터베이스 오류가 발생했습니다.', 'DB_ERROR', 500);
    return;
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, '잘못된 데이터 형식입니다.', 'VALIDATION_ERROR', 400);
    return;
  }

  // 3. 예상치 못한 에러 (프로그래밍 에러)
  console.error('Unexpected Error:', err);
  sendError(res, '서버 내부 오류가 발생했습니다.', 'INTERNAL_SERVER_ERROR', 500);
}
