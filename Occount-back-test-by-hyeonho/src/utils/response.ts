import { Response } from 'express';
import { ApiSuccessResponse, ApiErrorResponse } from '../types';

/**
 * 성공 응답 헬퍼
 */
export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  statusCode: number = 200,
): Response<ApiSuccessResponse<T>> {
  const body: ApiSuccessResponse<T> = { success: true };
  if (data !== undefined) body.data = data;
  if (message) body.message = message;
  return res.status(statusCode).json(body);
}

/**
 * 에러 응답 헬퍼
 */
export function sendError(
  res: Response,
  message: string,
  errorCode: string,
  statusCode: number = 500,
): Response<ApiErrorResponse> {
  const body: ApiErrorResponse = { success: false, error: errorCode, message };
  return res.status(statusCode).json(body);
}
