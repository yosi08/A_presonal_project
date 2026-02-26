import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';

import router from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// =============================================
// Middleware
// =============================================
app.use(cors({ origin: '*', credentials: true }));        // 개발 환경: 모든 origin 허용
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// =============================================
// API Docs (Swagger UI)
// =============================================
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'Occount API Docs',
    customCss: '.swagger-ui .topbar { background-color: #1a1a2e; }',
    swaggerOptions: {
      persistAuthorization: true,   // 새로고침해도 토큰 유지
      defaultModelsExpandDepth: -1, // 하단 스키마 섹션 접기
    },
  }),
);

// =============================================
// Health Check
// =============================================
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// =============================================
// API Routes
// =============================================
app.use('/', router);

// =============================================
// 404 Handler
// =============================================
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: '요청한 API 엔드포인트를 찾을 수 없습니다.',
  });
});

// =============================================
// Global Error Handler (마지막에 등록)
// =============================================
app.use(errorHandler);

export default app;
