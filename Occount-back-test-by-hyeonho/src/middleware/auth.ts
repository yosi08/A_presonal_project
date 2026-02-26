import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { JwtPayload } from '../types';

/**
 * JWT 인증 미들웨어
 * Authorization: Bearer <token> 헤더 검증
 */
export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return next(AppError.unauthorized('인증 토큰이 필요합니다.'));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET 환경 변수가 설정되지 않았습니다.');

    const payload = jwt.verify(token, secret) as JwtPayload;
    req.user = payload;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(AppError.unauthorized('토큰이 만료되었습니다.', 'TOKEN_EXPIRED'));
    }
    return next(AppError.unauthorized('유효하지 않은 토큰입니다.', 'INVALID_TOKEN'));
  }
}

/**
 * 역할 기반 접근 제어 (RBAC) 미들웨어
 * authenticateToken 이후에 사용해야 함
 */
export function authorizeRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized());
    }
    if (!roles.includes(req.user.roles)) {
      return next(AppError.forbidden('해당 기능에 대한 권한이 없습니다.'));
    }
    next();
  };
}
