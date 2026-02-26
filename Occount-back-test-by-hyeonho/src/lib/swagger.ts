import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Occount Backend API',
    version: '1.0.0',
    description: `
## Occount 협동조합 포인트 관리 시스템 API

### 인증 방식
- **JWT Bearer Token**: 로그인 후 발급된 토큰을 \`Authorization: Bearer <token>\` 헤더에 포함

### 역할(Role) 구분
| 역할 | 설명 |
|------|------|
| \`STUDENT\` | 학생 — 본인 정보/로그 조회, 문의 접수 |
| \`COOPERATIVE\` | 협동조합 담당자 — 거래/재고 관리 |
| \`ADMIN\` | 관리자 — 전체 접근 가능 |

### 공통 응답 형식
\`\`\`json
// 성공
{ "success": true, "data": { ... }, "message": "성공 메시지" }

// 실패
{ "success": false, "error": "ERROR_CODE", "message": "에러 메시지" }
\`\`\`
    `,
    contact: {
      name: 'Occount Dev Team',
    },
  },
  servers: [
    {
      url: 'http://localhost:8080',
      description: '개발 서버',
    },
    {
      url: 'https://your-cloudtype-domain.run.app',
      description: '프로덕션 서버',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'POST /auth/login 으로 발급받은 JWT 토큰을 입력하세요',
      },
    },
    schemas: {
      // =============================================
      // 공통 응답
      // =============================================
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: { type: 'object' },
          message: { type: 'string' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: { type: 'string', example: 'ERROR_CODE' },
          message: { type: 'string', example: '에러 메시지' },
        },
      },
      // =============================================
      // 사용자
      // =============================================
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          userNumber: { type: 'string', example: 'USR-001' },
          userCode: { type: 'string', example: 'BC20240001' },
          userName: { type: 'string', example: '김민준' },
          userEmail: { type: 'string', format: 'email', example: 'minjun@school.ac.kr' },
          userPoint: { type: 'integer', example: 5000 },
          userPhone: { type: 'string', example: '010-1234-5678', nullable: true },
          userAddress: { type: 'string', nullable: true },
          userBirthDay: { type: 'string', format: 'date', nullable: true },
          roles: { type: 'string', enum: ['STUDENT', 'COOPERATIVE', 'ADMIN'] },
          userType: { type: 'string', enum: ['STUDENT', 'GENERAL'] },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      RegisterRequest: {
        type: 'object',
        required: ['userNumber', 'userCode', 'userName', 'userEmail', 'userPassword'],
        properties: {
          userNumber: { type: 'string', example: 'USR-001', description: '사용자 번호 (고유)' },
          userCode: { type: 'string', example: 'BC20240001', description: '바코드 코드 (고유)' },
          userName: { type: 'string', example: '김민준' },
          userEmail: { type: 'string', format: 'email', example: 'minjun@school.ac.kr' },
          userPassword: { type: 'string', minLength: 8, example: 'Password1!' },
          userPhone: { type: 'string', example: '010-1234-5678' },
          userPin: { type: 'string', description: '4자리 PIN' },
          roles: { type: 'string', enum: ['STUDENT', 'COOPERATIVE', 'ADMIN'], default: 'STUDENT' },
          userType: { type: 'string', enum: ['STUDENT', 'GENERAL'], default: 'STUDENT' },
          stuNumber: { type: 'string', description: '학번 (학생인 경우)', nullable: true },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@occount.kr' },
          password: { type: 'string', example: 'Admin1234!' },
        },
      },
      // =============================================
      // 거래 로그
      // =============================================
      ChargeLog: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userCode: { type: 'string', example: 'BC20240001' },
          chargedPoint: { type: 'integer', example: 5000 },
          beforePoint: { type: 'integer', example: 0 },
          afterPoint: { type: 'integer', example: 5000 },
          managedEmail: { type: 'string', nullable: true },
          reason: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      PayLog: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          userCode: { type: 'string', example: 'BC20240001' },
          payedPoint: { type: 'integer', example: 2000 },
          beforePoint: { type: 'integer', example: 5000 },
          afterPoint: { type: 'integer', example: 3000 },
          eventType: { type: 'string', example: '아메리카노' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      // =============================================
      // 공지사항
      // =============================================
      Notice: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string', example: '운영 시간 안내' },
          content: { type: 'string', example: '평일 09:00~18:00 운영합니다.' },
          importance: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      // =============================================
      // 상품
      // =============================================
      Item: {
        type: 'object',
        properties: {
          itemCode: { type: 'string', example: 'ITEM001' },
          itemName: { type: 'string', example: '아메리카노' },
          itemPrice: { type: 'integer', example: 2000 },
          itemCategory: { type: 'string', example: '음료' },
          itemDescription: { type: 'string', nullable: true },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: '인증 토큰이 없거나 유효하지 않음',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'UNAUTHORIZED', message: '인증 토큰이 필요합니다.' },
          },
        },
      },
      Forbidden: {
        description: '권한 없음',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'FORBIDDEN', message: '해당 기능에 대한 권한이 없습니다.' },
          },
        },
      },
      NotFound: {
        description: '리소스를 찾을 수 없음',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'NOT_FOUND', message: '리소스를 찾을 수 없습니다.' },
          },
        },
      },
      ValidationError: {
        description: '입력값 검증 실패',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: { success: false, error: 'VALIDATION_ERROR', message: 'userEmail: 올바른 이메일 형식이 아닙니다.' },
          },
        },
      },
    },
  },
  // =============================================
  // 태그 (도메인 그룹)
  // =============================================
  tags: [
    { name: 'Auth', description: '인증 (회원가입, 로그인, 비밀번호 변경)' },
    { name: 'Account', description: '사용자/학생 계정 관리' },
    { name: 'Verify', description: '이메일 발송, 본인인증' },
    { name: 'Transaction', description: '포인트 충전/결제/거래 로그' },
    { name: 'Item', description: '상품 목록' },
    { name: 'Investment', description: '출자금 관리' },
    { name: 'Inventory', description: '재고 관리' },
    { name: 'Notice', description: '공지사항' },
    { name: 'Inquiry', description: '문의 접수/조회' },
    { name: 'PG', description: '결제 게이트웨이 (확인/환불)' },
    { name: 'Receipt', description: '영수증/재고변동 조회' },
    { name: 'Toss', description: 'Toss 상품 동기화' },
  ],
  // =============================================
  // 전체 경로 정의
  // =============================================
  paths: {
    // ---- AUTH ----
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: '회원 가입',
        description: '새 사용자를 등록합니다. 비밀번호는 해싱되어 저장됩니다.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } },
        },
        responses: {
          '201': {
            description: '회원가입 성공',
            content: {
              'application/json': {
                example: { success: true, data: { id: 5, userCode: 'TEST001', userName: '테스트', userEmail: 'test@occount.kr', userPoint: 0, roles: 'STUDENT' }, message: '회원가입이 완료되었습니다.' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
          '409': {
            description: '이메일 중복',
            content: { 'application/json': { example: { success: false, error: 'DUPLICATE_EMAIL', message: '이미 사용 중인 이메일입니다.' } } },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: '로그인 (JWT 발급)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } } },
        },
        responses: {
          '200': {
            description: '로그인 성공 — token을 이후 요청의 Authorization 헤더에 사용',
            content: {
              'application/json': {
                example: { success: true, data: { token: 'eyJhbGci...', user: { id: 1, roles: 'ADMIN' } }, message: '로그인 성공' },
              },
            },
          },
          '401': {
            description: '이메일/비밀번호 불일치',
            content: { 'application/json': { example: { success: false, error: 'INVALID_PASSWORD', message: '이메일 또는 비밀번호가 올바르지 않습니다.' } } },
          },
        },
      },
    },
    '/auth/pwChange/{resetToken}': {
      post: {
        tags: ['Auth'],
        summary: '비밀번호 재설정',
        description: '이메일로 받은 resetToken으로 비밀번호를 변경합니다.',
        parameters: [{ name: 'resetToken', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['newPassword'], properties: { newPassword: { type: 'string', minLength: 8, example: 'NewPass1!' } } } } },
        },
        responses: {
          '200': { description: '비밀번호 변경 성공' },
          '401': { description: '토큰 만료 또는 이미 사용된 토큰' },
        },
      },
    },
    // ---- ACCOUNT ----
    '/account/user/list': {
      get: {
        tags: ['Account'],
        summary: '전체 사용자 목록 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        responses: {
          '200': {
            description: '사용자 목록',
            content: { 'application/json': { example: { success: true, data: { userList: [{ id: 1, userCode: 'ADMIN001', userName: '관리자' }] } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/account/user/info': {
      get: {
        tags: ['Account'],
        summary: '내 정보 조회 (로그인한 본인)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: '본인 정보',
            content: { 'application/json': { example: { success: true, data: { userName: '김민준', userEmail: 'minjun@school.ac.kr', userPoint: 5000, roles: 'STUDENT' } } } },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/account/user/{userCode}': {
      get: {
        tags: ['Account'],
        summary: '특정 사용자 조회 (userCode)',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        parameters: [{ name: 'userCode', in: 'path', required: true, schema: { type: 'string' }, example: 'BC20240001' }],
        responses: {
          '200': { description: '사용자 정보' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/account/user': {
      post: {
        tags: ['Account'],
        summary: '사용자 추가 (관리자)',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN**',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterRequest' } } } },
        responses: { '201': { description: '사용자 추가 성공' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
      put: {
        tags: ['Account'],
        summary: '내 정보 수정 (본인)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { userName: { type: 'string' }, userPhone: { type: 'string' }, userAddress: { type: 'string' } } } } },
        },
        responses: { '200': { description: '수정 성공' }, '401': { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/account/user/{userNumber}': {
      put: {
        tags: ['Account'],
        summary: '사용자 정보 수정 (관리자)',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN**',
        parameters: [{ name: 'userNumber', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { userPoint: { type: 'integer' }, isActive: { type: 'boolean' } } } } } },
        responses: { '200': { description: '수정 성공' }, '401': { $ref: '#/components/responses/Unauthorized' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/account/user/update/batch': {
      put: {
        tags: ['Account'],
        summary: '사용자 일괄 수정',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN**',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { userNumberList: { type: 'array', items: { type: 'string' } }, userUpdateRequest: { type: 'object' } } }, example: { userNumberList: ['USR-001', 'USR-002'], userUpdateRequest: { isActive: false } } } },
        },
        responses: { '200': { description: '일괄 수정 성공' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/account/user/batch': {
      delete: {
        tags: ['Account'],
        summary: '사용자 일괄 삭제 (비활성화)',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN** — soft delete (isActive = false)',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'array', items: { type: 'string' } }, example: ['USR-001', 'USR-002'] } } },
        responses: { '200': { description: '삭제 성공' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/account/student/list': {
      get: {
        tags: ['Account'],
        summary: '학생 마스터 목록 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        responses: { '200': { description: '학생 목록' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/account/student/{stuCode}': {
      get: {
        tags: ['Account'],
        summary: '학번으로 학생 조회',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'stuCode', in: 'path', required: true, schema: { type: 'string' }, example: 'STU001' }],
        responses: { '200': { description: '학생 정보' }, '404': { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/account/student/email/{stuEmail}': {
      get: {
        tags: ['Account'],
        summary: '이메일로 학생 조회',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'stuEmail', in: 'path', required: true, schema: { type: 'string', format: 'email' } }],
        responses: { '200': { description: '학생 정보' }, '404': { $ref: '#/components/responses/NotFound' } },
      },
    },
    // ---- VERIFY ----
    '/verify/send': {
      post: {
        tags: ['Verify'],
        summary: '비밀번호 재설정 이메일 발송',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['userEmail', 'userName'], properties: { userEmail: { type: 'string', format: 'email' }, userName: { type: 'string' } } } } },
        },
        responses: { '200': { description: '이메일 발송 완료 (존재하지 않는 이메일도 동일 응답 — 보안)' } },
      },
    },
    '/verify/identity': {
      post: {
        tags: ['Verify'],
        summary: '본인인증 (PortOne)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['identityVerificationId'], properties: { identityVerificationId: { type: 'string', example: 'imp_123456789' } } } } },
        },
        responses: {
          '200': {
            description: '본인인증 성공',
            content: { 'application/json': { example: { success: true, data: { isVerified: true, name: '홍길동', birth: '2000-01-01', phone: '010-0000-0000' } } } },
          },
        },
      },
    },
    // ---- TRANSACTION ----
    '/transaction/barcode': {
      post: {
        tags: ['Transaction'],
        summary: '바코드로 사용자 조회 (현장 단말용)',
        description: '인증 불필요 — 현장 POS 단말에서 사용',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['userCode'], properties: { userCode: { type: 'string', example: 'BC20240001' } } } } } },
        responses: {
          '200': { content: { 'application/json': { example: { success: true, data: { userName: '김민준', userPoint: 5000 } } } }, description: '사용자 정보' },
          '404': { $ref: '#/components/responses/NotFound' },
        },
      },
    },
    '/transaction/chargelog': {
      get: {
        tags: ['Transaction'],
        summary: '내 충전 기록 조회 (본인)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '충전 로그 목록', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/ChargeLog' } } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/transaction/paylog': {
      get: {
        tags: ['Transaction'],
        summary: '내 결제 기록 조회 (본인)',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '결제 로그 목록', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/PayLog' } } } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/transaction/admin/chargelog': {
      get: {
        tags: ['Transaction'],
        summary: '전체 충전 기록 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        responses: { '200': { description: '전체 충전 로그' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/transaction/admin/paylog': {
      get: {
        tags: ['Transaction'],
        summary: '전체 결제 기록 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        responses: { '200': { description: '전체 결제 로그' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/transaction/chargelog/{userCode}': {
      get: {
        tags: ['Transaction'],
        summary: '특정 사용자 충전 기록 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        parameters: [{ name: 'userCode', in: 'path', required: true, schema: { type: 'string' }, example: 'BC20240001' }],
        responses: { '200': { description: '충전 로그' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/transaction/paylog/{userCode}': {
      get: {
        tags: ['Transaction'],
        summary: '특정 사용자 결제 기록 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        parameters: [{ name: 'userCode', in: 'path', required: true, schema: { type: 'string' }, example: 'BC20240001' }],
        responses: { '200': { description: '결제 로그' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/transaction/charge': {
      post: {
        tags: ['Transaction'],
        summary: '포인트 충전',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE** — 원자적 처리 (포인트 갱신 + 로그 동시 저장)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['userCode', 'chargedPoint'], properties: { userCode: { type: 'string', example: 'BC20240001' }, chargedPoint: { type: 'integer', minimum: 1, example: 5000 } } } } },
        },
        responses: {
          '200': { content: { 'application/json': { example: { success: true, data: { userCode: 'BC20240001', userName: '김민준', beforePoint: 0, afterPoint: 5000, chargedPoint: 5000 }, message: '포인트 충전이 완료되었습니다.' } } }, description: '충전 결과' },
          '404': { description: '사용자 없음' },
        },
      },
    },
    '/transaction/charges': {
      post: {
        tags: ['Transaction'],
        summary: '포인트 일괄 충전',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE** — 여러 사용자에게 동일 포인트 일괄 충전',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['userCodeList', 'chargedPoint'], properties: { userCodeList: { type: 'array', items: { type: 'string' }, example: ['BC001', 'BC002'] }, chargedPoint: { type: 'integer', example: 3000 }, reason: { type: 'string', example: '행사 지급' } } } } },
        },
        responses: { '200': { description: '일괄 충전 결과' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/transaction/pay': {
      post: {
        tags: ['Transaction'],
        summary: '포인트 결제',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE** — 포인트 부족 시 INSUFFICIENT_POINTS 에러',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['userCode', 'eventType', 'payedPoint'], properties: { userCode: { type: 'string', example: 'BC20240001' }, eventType: { type: 'string', example: '아메리카노' }, payedPoint: { type: 'integer', minimum: 1, example: 2000 } } } } },
        },
        responses: {
          '200': { content: { 'application/json': { example: { success: true, data: { userCode: 'BC20240001', beforePoint: 5000, afterPoint: 3000, payedPoint: 2000 }, message: '결제가 완료되었습니다.' } } }, description: '결제 결과' },
          '400': { content: { 'application/json': { example: { success: false, error: 'INSUFFICIENT_POINTS', message: '포인트가 부족합니다.' } } }, description: '포인트 부족' },
        },
      },
    },
    // ---- ITEM ----
    '/item/': {
      get: {
        tags: ['Item'],
        summary: '상품 목록 조회',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: '활성 상품 목록', content: { 'application/json': { example: { success: true, data: { itemList: [{ itemCode: 'ITEM001', itemName: '아메리카노', itemPrice: 2000 }] } } } } },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    // ---- INVESTMENT ----
    '/investment/': {
      post: {
        tags: ['Investment'],
        summary: '출자금 등록',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN**',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['userNumber', 'amount'], properties: { userNumber: { type: 'string' }, amount: { type: 'integer', example: 50000 } } } } } },
        responses: { '201': { description: '등록 성공' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/investment/list': {
      get: {
        tags: ['Investment'],
        summary: '출자금 목록 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        responses: { '200': { description: '출자금 목록' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/investment/batch': {
      put: {
        tags: ['Investment'],
        summary: '출자금 일괄 수정',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN**',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { investments: { type: 'array', items: { type: 'object', properties: { id: { type: 'integer' }, amount: { type: 'integer' } } } } } } } } },
        responses: { '200': { description: '수정 성공' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    // ---- INVENTORY ----
    '/inventory/': {
      get: {
        tags: ['Inventory'],
        summary: '기간별 재고 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        parameters: [
          { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date' }, example: '2026-02-01' },
          { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date' }, example: '2026-02-28' },
        ],
        responses: { '200': { description: '재고 목록' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/inventory/byday/{stdDate}': {
      get: {
        tags: ['Inventory'],
        summary: '특정 날짜 재고 스냅샷 조회',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'stdDate', in: 'path', required: true, schema: { type: 'string', format: 'date' }, example: '2026-02-23' }],
        responses: { '200': { description: '일일 스냅샷' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/inventory/snapshot': {
      post: {
        tags: ['Inventory'],
        summary: '재고 스냅샷 생성',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE** — 당일 재고 상태를 스냅샷으로 저장',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { items: { type: 'array', items: { type: 'object', properties: { itemCode: { type: 'string' }, quantity: { type: 'integer' } } } } } } } } },
        responses: { '201': { description: '스냅샷 생성 성공' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    // ---- NOTICE ----
    '/notices': {
      get: {
        tags: ['Notice'],
        summary: '공지사항 목록 조회',
        description: '인증 불필요 — importance 내림차순, 최신순 정렬',
        responses: {
          '200': { description: '공지 목록', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: { $ref: '#/components/schemas/Notice' } } } } } } },
        },
      },
      post: {
        tags: ['Notice'],
        summary: '공지사항 등록',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN**',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['title', 'content', 'importance'], properties: { title: { type: 'string' }, content: { type: 'string' }, importance: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] } } } } } },
        responses: { '201': { description: '등록 성공' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/notices/{id}': {
      get: {
        tags: ['Notice'],
        summary: '공지사항 상세 조회',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: '공지 상세', content: { 'application/json': { schema: { $ref: '#/components/schemas/Notice' } } } }, '404': { $ref: '#/components/responses/NotFound' } },
      },
      put: {
        tags: ['Notice'],
        summary: '공지사항 수정',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN**',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' }, importance: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] } } } } } },
        responses: { '200': { description: '수정 성공' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
      delete: {
        tags: ['Notice'],
        summary: '공지사항 삭제 (soft delete)',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN** — isActive = false 처리',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { '200': { description: '삭제 성공' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    // ---- INQUIRY ----
    '/inquiry/new': {
      post: {
        tags: ['Inquiry'],
        summary: '문의 접수',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['title', 'content', 'category'], properties: { title: { type: 'string', example: '포인트 관련 문의' }, content: { type: 'string', example: '충전한 포인트가 반영이 안 됩니다.' }, category: { type: 'string', enum: ['POINT', 'ACCOUNT', 'ETC'] } } } } },
        },
        responses: { '201': { description: '문의 접수 완료' }, '401': { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    '/inquiry/list': {
      get: {
        tags: ['Inquiry'],
        summary: '문의 목록 조회',
        security: [{ bearerAuth: [] }],
        description: 'STUDENT: 본인 문의만 / COOPERATIVE·ADMIN: 전체 문의 조회',
        responses: { '200': { description: '문의 목록' }, '401': { $ref: '#/components/responses/Unauthorized' } },
      },
    },
    // ---- PG ----
    '/pg/confirm': {
      post: {
        tags: ['PG'],
        summary: '결제 확인 (PG사 검증)',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['paymentId'], properties: { paymentId: { type: 'string', example: 'pay_abc123' } } } } } },
        responses: { '200': { description: '결제 확인 완료', content: { 'application/json': { example: { success: true, data: { paymentId: 'pay_abc123', amount: 10000, status: 'COMPLETED' } } } } } },
      },
    },
    '/pg/payment/{paymentId}': {
      get: {
        tags: ['PG'],
        summary: '결제 조회',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'paymentId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: '결제 정보' }, '404': { $ref: '#/components/responses/NotFound' } },
      },
    },
    '/pg/refund': {
      post: {
        tags: ['PG'],
        summary: '환불 처리',
        security: [{ bearerAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['paymentId', 'reason'], properties: { paymentId: { type: 'string' }, reason: { type: 'string', example: '고객 요청 환불' } } } } } },
        responses: { '200': { description: '환불 완료', content: { 'application/json': { example: { success: true, data: { refundId: 'ref_xyz789', message: '환불이 완료되었습니다.' } } } } } },
      },
    },
    // ---- RECEIPT ----
    '/receipt/receiptcheck': {
      get: {
        tags: ['Receipt'],
        summary: '기간별 영수증 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        parameters: [
          { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date' }, example: '2026-02-01' },
          { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date' }, example: '2026-02-28' },
        ],
        responses: { '200': { description: '영수증 목록' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    '/receipt/stockvariance': {
      get: {
        tags: ['Receipt'],
        summary: '기간별 재고 변동 조회',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE**',
        parameters: [
          { name: 'startDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
          { name: 'endDate', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
        ],
        responses: { '200': { description: '재고 변동 내역' }, '403': { $ref: '#/components/responses/Forbidden' } },
      },
    },
    // ---- TOSS ----
    '/toss/': {
      post: {
        tags: ['Toss'],
        summary: 'Toss 상품 동기화',
        security: [{ bearerAuth: [] }],
        description: '**권한: ADMIN, COOPERATIVE** — Toss 쪽 상품 정보를 가져와 동기화 (Mock)',
        responses: {
          '200': { description: '동기화 완료', content: { 'application/json': { example: { success: true, data: { updatedItems: 5, totalItems: 5 } } } } },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
