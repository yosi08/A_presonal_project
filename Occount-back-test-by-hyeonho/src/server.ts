import 'dotenv/config';
import app from './app';
import prisma from './lib/prisma';

const PORT = Number(process.env.PORT) || 8080;

async function main() {
  try {
    // DB 연결 확인
    await prisma.$connect();
    console.log('✅ PostgreSQL 데이터베이스 연결 성공');

    // HTTP 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 Occount 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`   Base URL: http://localhost:${PORT}`);
      console.log(`   Health:   http://localhost:${PORT}/health`);
      console.log(`   ENV:      ${process.env.NODE_ENV ?? 'development'}`);
    });
  } catch (err) {
    console.error('❌ 서버 시작 실패:', err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// 프로세스 종료 시 DB 연결 해제
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

main();
