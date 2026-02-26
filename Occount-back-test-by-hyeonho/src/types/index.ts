import { Role, UserType } from '@prisma/client';

// Re-export Prisma enums
export { Role, UserType };

// =============================================
// Common Response Types
// =============================================

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
}

// =============================================
// JWT Payload
// =============================================

export interface JwtPayload {
  userId: number;
  userCode: string;
  email: string;
  roles: Role;
}

// =============================================
// Augmented Request (for auth middleware)
// =============================================

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
