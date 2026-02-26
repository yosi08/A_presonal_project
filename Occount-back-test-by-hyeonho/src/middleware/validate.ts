import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../utils/AppError';

type ValidateTarget = 'body' | 'params' | 'query';

/**
 * Zod 스키마 기반 요청 검증 미들웨어 팩토리
 */
export function validate(schema: ZodSchema, target: ValidateTarget = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      const zodError = result.error as ZodError;
      const message = zodError.errors
        .map((e) => `${e.path.join('.')}: ${e.message}`)
        .join(', ');
      return next(AppError.badRequest(message, 'VALIDATION_ERROR'));
    }
    // 검증된 데이터로 교체 (불필요한 필드 제거)
    req[target] = result.data;
    next();
  };
}
