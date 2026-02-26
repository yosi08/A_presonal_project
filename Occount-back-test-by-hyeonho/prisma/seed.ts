import { PrismaClient, Role, UserType, NoticeImportance } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 시드 데이터 생성 시작...');

  // 1. 학생 마스터 데이터
  const student1 = await prisma.student.upsert({
    where: { stuCode: 'STU001' },
    update: {},
    create: {
      stuCode: 'STU001',
      stuName: '김민준',
      stuNumber: '20240001',
      stuBirth: new Date('2005-03-15'),
      stuEmail: 'minjun@school.ac.kr',
      isRegistered: true,
    },
  });

  const student2 = await prisma.student.upsert({
    where: { stuCode: 'STU002' },
    update: {},
    create: {
      stuCode: 'STU002',
      stuName: '이서연',
      stuNumber: '20240002',
      stuBirth: new Date('2005-07-22'),
      stuEmail: 'seoyeon@school.ac.kr',
      isRegistered: false,
    },
  });

  // 2. 관리자 사용자
  await prisma.user.upsert({
    where: { userEmail: 'admin@occount.kr' },
    update: {},
    create: {
      userNumber: 'USR-ADMIN-001',
      userCode: 'ADMIN001',
      userName: '관리자',
      userEmail: 'admin@occount.kr',
      userPassword: await bcrypt.hash('Admin1234!', 12),
      roles: Role.ADMIN,
      userType: UserType.GENERAL,
      userPoint: 0,
    },
  });

  // 3. 협동조합 사용자
  await prisma.user.upsert({
    where: { userEmail: 'coop@occount.kr' },
    update: {},
    create: {
      userNumber: 'USR-COOP-001',
      userCode: 'COOP001',
      userName: '협동조합담당자',
      userEmail: 'coop@occount.kr',
      userPassword: await bcrypt.hash('Coop1234!', 12),
      roles: Role.COOPERATIVE,
      userType: UserType.GENERAL,
      userPoint: 0,
    },
  });

  // 4. 학생 사용자 1 (student1과 연결)
  const studentUser1 = await prisma.user.upsert({
    where: { userEmail: 'minjun@school.ac.kr' },
    update: {},
    create: {
      userNumber: 'USR-STU-001',
      userCode: 'BC20240001',
      userName: '김민준',
      userEmail: 'minjun@school.ac.kr',
      userPassword: await bcrypt.hash('Student1234!', 12),
      roles: Role.STUDENT,
      userType: UserType.STUDENT,
      userPoint: 5000,
      stuNumber: student1.stuNumber,
    },
  });

  // 학생 사용자 2
  await prisma.user.upsert({
    where: { userEmail: 'student2@school.ac.kr' },
    update: {},
    create: {
      userNumber: 'USR-STU-002',
      userCode: 'BC20240002',
      userName: '박지훈',
      userEmail: 'student2@school.ac.kr',
      userPassword: await bcrypt.hash('Student1234!', 12),
      roles: Role.STUDENT,
      userType: UserType.STUDENT,
      userPoint: 3000,
    },
  });

  // 5. 투자 데이터
  await prisma.investment.upsert({
    where: { id: 1 },
    update: {},
    create: { userNumber: studentUser1.userNumber, amount: 50000 },
  });

  // 6. 상품 데이터
  const items = [
    { itemCode: 'ITEM001', itemName: '아메리카노', itemPrice: 2000, itemCategory: '음료', itemDescription: '따뜻한 아메리카노' },
    { itemCode: 'ITEM002', itemName: '카페라떼', itemPrice: 2500, itemCategory: '음료', itemDescription: '부드러운 카페라떼' },
    { itemCode: 'ITEM003', itemName: '샌드위치', itemPrice: 3500, itemCategory: '식품', itemDescription: '신선한 야채 샌드위치' },
    { itemCode: 'ITEM004', itemName: '음료수', itemPrice: 1500, itemCategory: '음료', itemDescription: '탄산 음료수' },
    { itemCode: 'ITEM005', itemName: '과자', itemPrice: 1000, itemCategory: '스낵', itemDescription: '다양한 과자류' },
  ];

  for (const item of items) {
    await prisma.item.upsert({ where: { itemCode: item.itemCode }, update: {}, create: item });
  }

  // 7. 공지사항
  await prisma.notice.createMany({
    data: [
      { title: '🎉 Occount 서비스 오픈 안내', content: 'Occount 협동조합 포인트 관리 서비스가 오픈되었습니다.', importance: NoticeImportance.HIGH },
      { title: '운영 시간 안내', content: '평일 09:00 ~ 18:00 운영합니다.', importance: NoticeImportance.LOW },
    ],
    skipDuplicates: true,
  });

  console.log('✅ 시드 데이터 생성 완료!');
  console.log('   - 관리자 계정: admin@occount.kr / Admin1234!');
  console.log('   - 협동조합 계정: coop@occount.kr / Coop1234!');
  console.log('   - 학생 계정: minjun@school.ac.kr / Student1234!');
}

main()
  .catch((e) => { console.error('❌ Seed 실패:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
