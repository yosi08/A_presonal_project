# Occount Backend API 명세서

## 개요
이 문서는 Occount 백엔드 API의 전체 명세서입니다. 프론트엔드 개발 시 참고하여 사용하시기 바랍니다.

## 기본 정보
- **Base URL**: `http://localhost:8080` (개발 환경)
- **Content-Type**: `application/json; charset=UTF-8`
- **인증 방식**: JWT Token (Authorization 헤더에 Bearer 토큰 포함)

## 공통 응답 형식

### 성공 응답
```json
{
  "success": true,
  "data": { ... },
  "message": "성공 메시지"
}
```

### 에러 응답
```json
{
  "success": false,
  "error": "에러 코드",
  "message": "에러 메시지"
}
```

---

## 1. 인증 (Authentication)

### 1.1 회원가입
- **URL**: `POST /auth/register`
- **설명**: 새로운 사용자 회원가입
- **요청 본문**:
```json
{
  "userNumber": "string",
  "userCode": "string",
  "userCiNumber": "string",
  "userName": "string",
  "userAddress": "string",
  "userPhone": "string",
  "userEmail": "string",
  "userPassword": "string",
  "userPin": "string",
  "userFingerPrint": "string",
  "roles": "STUDENT|ADMIN|COOPERATIVE",
  "userType": "STUDENT|GENERAL"
}
```
- **응답**: 생성된 사용자 정보

### 1.2 비밀번호 변경
- **URL**: `POST /auth/pwChange/{resetToken}`
- **설명**: 비밀번호 재설정 토큰을 사용하여 비밀번호 변경
- **요청 본문**:
```json
{
  "newPassword": "string"
}
```
- **응답**: 성공/실패 메시지

---

## 2. 계정 관리 (Account)

### 2.1 사용자 목록 조회
- **URL**: `GET /account/user/list`
- **설명**: 전체 사용자 목록 조회 (관리자용)
- **응답**:
```json
{
  "userList": [
    {
      "userNumber": "string",
      "userCode": "string",
      "userName": "string",
      "userEmail": "string",
      "userPoint": 0,
      "roles": "string",
      "totalInvestmentAmount": 0,
      "investments": [...],
      "stuNumber": "string"
    }
  ]
}
```

### 2.2 사용자 상세 조회
- **URL**: `GET /account/user/{userCode}`
- **설명**: 특정 사용자 코드로 사용자 정보 조회
- **응답**:
```json
{
  "userNumber": "string",
  "userCode": "string",
  "userCiNumber": "string",
  "userBirthDay": "string",
  "userName": "string",
  "userAddress": "string",
  "userPhone": "string",
  "userEmail": "string",
  "userPoint": 0,
  "roles": "string",
  "todayTotalPayment": 0
}
```

### 2.3 사용자 추가
- **URL**: `POST /account/user/`
- **설명**: 새로운 사용자 추가 (관리자용)
- **요청 본문**: 회원가입과 동일
- **응답**: 생성된 사용자 정보

### 2.4 본인 정보 조회
- **URL**: `GET /account/user/info`
- **설명**: 로그인한 사용자의 본인 정보 조회
- **응답**:
```json
{
  "userName": "string",
  "userEmail": "string",
  "userAddress": "string",
  "userPhone": "string",
  "userType": "string",
  "userBirthDate": "string",
  "investmentAmount": 0,
  "userPoint": 0,
  "userCode": "string",
  "todayTotalPayment": 0,
  "roles": "string"
}
```

### 2.5 사용자 정보 수정 (본인)
- **URL**: `PUT /account/user/`
- **설명**: 로그인한 사용자의 본인 정보 수정
- **요청 본문**:
```json
{
  "userCode": "string",
  "userCiNumber": "string",
  "userName": "string",
  "userAddress": "string",
  "userPhone": "string",
  "userEmail": "string",
  "userPassword": "string",
  "userPin": "string",
  "roles": "string",
  "newPassword": "string",
  "newPin": "string",
  "userBirthDay": "string",
  "userFingerPrint": "string",
  "securityUpdate": true,
  "temporaryToken": "string"
}
```

### 2.6 사용자 정보 수정 (관리자)
- **URL**: `PUT /account/user/{userNumber}`
- **설명**: 관리자가 특정 사용자 정보 수정
- **요청 본문**: 사용자 정보 수정과 동일

### 2.7 사용자 일괄 수정
- **URL**: `PUT /account/user/update/batch`
- **설명**: 여러 사용자 정보 일괄 수정
- **요청 본문**:
```json
{
  "userNumberList": ["string"],
  "userUpdateRequest": { ... }
}
```

### 2.8 사용자 일괄 삭제
- **URL**: `DELETE /account/user/batch`
- **설명**: 여러 사용자 일괄 삭제
- **요청 본문**:
```json
["userNumber1", "userNumber2", ...]
```

### 2.9 학생 목록 조회
- **URL**: `GET /account/student/list`
- **설명**: 학생 목록 조회 (가입 여부 포함)
- **응답**:
```json
{
  "studentList": [
    {
      "stuCode": "string",
      "stuName": "string",
      "stuNumber": "string",
      "stuBirth": "date",
      "stuEmail": "string",
      "isRegistered": true
    }
  ]
}
```

### 2.10 학생 상세 조회
- **URL**: `GET /account/student/{stuCode}`
- **설명**: 특정 학생 정보 조회
- **응답**: 학생 정보

### 2.11 학생 이메일로 조회
- **URL**: `GET /account/student/email/{stuEmail}`
- **설명**: 이메일로 학생 정보 조회
- **응답**: 학생 정보

---

## 3. 본인인증 (Verification)

### 3.1 비밀번호 재설정 메일 발송
- **URL**: `POST /verify/send`
- **설명**: 비밀번호 재설정을 위한 메일 발송
- **요청 본문**:
```json
{
  "userEmail": "string",
  "userName": "string"
}
```
- **응답**:
```json
{
  "success": true,
  "message": "string"
}
```

### 3.2 본인인증
- **URL**: `POST /verify/identity`
- **설명**: PortOne을 통한 본인인증
- **요청 본문**:
```json
{
  "identityVerificationId": "string"
}
```
- **응답**:
```json
{
  "success": true,
  "message": "string",
  "verificationId": "string",
  "name": "string",
  "birth": "string",
  "phone": "string",
  "isVerified": true
}
```

---

## 4. 거래 (Transaction)

### 4.1 바코드로 사용자 조회
- **URL**: `POST /transaction/barcode`
- **설명**: 바코드로 사용자 이름과 포인트 조회
- **요청 본문**:
```json
{
  "userCode": "string"
}
```
- **응답**:
```json
{
  "userName": "string",
  "userPoint": 0
}
```

### 4.2 사용자 충전 로그 조회
- **URL**: `GET /transaction/chargelog/{userCode}`
- **설명**: 특정 사용자의 충전 로그 조회
- **응답**: 충전 로그 목록

### 4.3 사용자 결제 로그 조회
- **URL**: `GET /transaction/paylog/{userCode}`
- **설명**: 특정 사용자의 결제 로그 조회
- **응답**: 결제 로그 목록

### 4.4 본인 충전 로그 조회
- **URL**: `GET /transaction/chargelog`
- **설명**: 로그인한 사용자의 본인 충전 로그 조회
- **응답**: 충전 로그 목록

### 4.5 본인 결제 로그 조회
- **URL**: `GET /transaction/paylog`
- **설명**: 로그인한 사용자의 본인 결제 로그 조회
- **응답**: 결제 로그 목록

### 4.6 관리자용 전체 충전 로그 조회
- **URL**: `GET /transaction/admin/chargelog`
- **설명**: 관리자용 전체 충전 로그 조회
- **응답**:
```json
{
  "chargeLogList": [
    {
      "id": 0,
      "userCode": "string",
      "userName": "string",
      "chargedPoint": 0,
      "beforePoint": 0,
      "afterPoint": 0,
      "managedEmail": "string",
      "createdAt": "datetime"
    }
  ]
}
```

### 4.7 관리자용 전체 결제 로그 조회
- **URL**: `GET /transaction/admin/paylog`
- **설명**: 관리자용 전체 결제 로그 조회
- **응답**:
```json
{
  "payLogList": [
    {
      "id": 0,
      "userCode": "string",
      "userName": "string",
      "payedPoint": 0,
      "beforePoint": 0,
      "afterPoint": 0,
      "eventType": "string",
      "createdAt": "datetime"
    }
  ]
}
```

### 4.8 포인트 충전
- **URL**: `POST /transaction/charge`
- **설명**: 특정 사용자 포인트 충전
- **요청 본문**:
```json
{
  "userCode": "string",
  "chargedPoint": 0
}
```
- **응답**:
```json
{
  "userCode": "string",
  "userName": "string",
  "beforePoint": 0,
  "afterPoint": 0,
  "chargedPoint": 0
}
```

### 4.9 다중 사용자 충전
- **URL**: `POST /transaction/charges`
- **설명**: 여러 사용자 동시 충전
- **요청 본문**:
```json
{
  "userCodeList": ["string"],
  "chargedPoint": 0,
  "reason": "string"
}
```
- **응답**:
```json
{
  "chargesList": [
    {
      "userCode": "string",
      "userName": "string",
      "beforePoint": 0,
      "afterPoint": 0,
      "chargedPoint": 0
    }
  ]
}
```

### 4.10 포인트 결제
- **URL**: `POST /transaction/pay`
- **설명**: 포인트 결제
- **요청 본문**:
```json
{
  "userCode": "string",
  "eventType": "string",
  "payedPoint": 0
}
```
- **응답**:
```json
{
  "userCode": "string",
  "userName": "string",
  "beforePoint": 0,
  "afterPoint": 0,
  "payedPoint": 0
}
```

---

## 5. 상품 (Item)

### 5.1 상품 목록 조회
- **URL**: `GET /item/`
- **설명**: 전체 상품 목록 조회
- **응답**:
```json
{
  "itemList": [
    {
      "itemCode": "string",
      "itemName": "string",
      "itemPrice": 0,
      "itemCategory": "string",
      "itemDescription": "string"
    }
  ]
}
```

---

## 6. 투자 (Investment)

### 6.1 투자 정보 추가
- **URL**: `POST /investment`
- **설명**: 학생 출자금 정보 추가 (관리자용)
- **요청 본문**:
```json
{
  "userNumber": "string",
  "amount": 0
}
```

### 6.2 투자 목록 조회
- **URL**: `GET /investment/list`
- **설명**: 출자금 목록 조회
- **응답**: 투자 정보 목록

### 6.3 투자 일괄 업데이트
- **URL**: `PUT /investment/batch`
- **설명**: 투자 정보 일괄 업데이트
- **요청 본문**:
```json
{
  "investments": [
    {
      "userNumber": "string",
      "amount": 0
    }
  ]
}
```
- **응답**:
```json
{
  "successCount": 0,
  "failureCount": 0,
  "errors": ["string"]
}
```

---

## 7. 재고 (Inventory)

### 7.1 기간별 재고 조회
- **URL**: `GET /inventory/?startDate={date}&endDate={date}`
- **설명**: 특정 기간의 재고 정보 조회
- **응답**:
```json
{
  "inventoryList": [
    {
      "id": 0,
      "itemCode": "string",
      "itemName": "string",
      "itemQuantity": 0,
      "date": "date"
    }
  ]
}
```

### 7.2 일별 재고 변동 조회
- **URL**: `GET /inventory/byday/{stdDate}`
- **설명**: 특정 날짜의 재고 변동 사항 조회
- **응답**:
```json
{
  "snapshotList": [
    {
      "itemCode": "string",
      "itemName": "string",
      "beforeQuantity": 0,
      "afterQuantity": 0,
      "changeQuantity": 0,
      "reason": "string",
      "createdAt": "datetime"
    }
  ]
}
```

### 7.3 재고 스냅샷 생성
- **URL**: `POST /inventory/snapshot`
- **설명**: 재고 스냅샷 생성
- **요청 본문**:
```json
{
  "items": [
    {
      "itemCode": "string",
      "itemQuantity": 0,
      "reason": "string"
    }
  ]
}
```
- **응답**:
```json
{
  "results": [
    {
      "itemCode": "string",
      "itemQuantity": 0,
      "success": true,
      "message": "string"
    }
  ]
}
```

---

## 8. 공지사항 (Notice)

### 8.1 공지사항 목록 조회
- **URL**: `GET /notices`
- **설명**: 전체 공지사항 목록 조회
- **응답**: 공지사항 목록

### 8.2 공지사항 상세 조회
- **URL**: `GET /notices/{id}`
- **설명**: 특정 공지사항 상세 조회
- **응답**: 공지사항 상세 정보

### 8.3 공지사항 생성
- **URL**: `POST /notices`
- **설명**: 새로운 공지사항 생성
- **요청 본문**:
```json
{
  "title": "string",
  "content": "string",
  "importance": "LOW|MEDIUM|HIGH"
}
```

### 8.4 공지사항 수정
- **URL**: `PUT /notices/{id}`
- **설명**: 공지사항 수정
- **요청 본문**: 공지사항 생성과 동일

### 8.5 공지사항 삭제
- **URL**: `DELETE /notices/{id}`
- **설명**: 공지사항 삭제

---

## 9. 영수증 (Receipt)

### 9.1 기간별 영수증 조회
- **URL**: `GET /receipt/receiptcheck?startDate={date}&endDate={date}`
- **설명**: 특정 기간의 영수증 조회
- **응답**:
```json
{
  "receiptList": [
    {
      "id": 0,
      "userCode": "string",
      "userName": "string",
      "payedPoint": 0,
      "eventType": "string",
      "createdAt": "datetime"
    }
  ]
}
```

### 9.2 재고 변동 조회
- **URL**: `GET /receipt/stockvariance?startDate={date}&endDate={date}`
- **설명**: 특정 기간의 모든 영수증 조회 (일반 + 키오스크)
- **응답**:
```json
{
  "sumReceiptList": [
    {
      "userCode": "string",
      "userName": "string",
      "payedPoint": 0,
      "eventType": "string",
      "receiptType": "string",
      "createdAt": "datetime"
    }
  ]
}
```

---

## 10. 문의 (Inquiry)

### 10.1 문의 접수
- **URL**: `POST /inquiry/new`
- **설명**: 새로운 문의 접수
- **요청 본문**:
```json
{
  "title": "string",
  "content": "string",
  "category": "GENERAL|TECHNICAL|PAYMENT|OTHER"
}
```
- **응답**:
```json
{
  "message": "string"
}
```

### 10.2 문의 목록 조회
- **URL**: `GET /inquiry/list`
- **설명**: 문의 목록 조회
- **응답**:
```json
{
  "inquiryList": [
    {
      "id": 0,
      "userEmail": "string",
      "inquiryTitle": "string",
      "inquiryContent": "string",
      "inquiryType": "string",
      "createdAt": "datetime",
      "answeredAt": "datetime"
    }
  ]
}
```

---

## 11. 결제 (Payment Gateway)

### 11.1 결제 확인
- **URL**: `POST /pg/confirm`
- **설명**: 결제 확인 및 처리
- **요청 본문**:
```json
{
  "paymentId": "string"
}
```
- **응답**:
```json
{
  "success": true,
  "message": "string",
  "paymentInfo": {
    "paymentId": "string",
    "amount": 0,
    "status": "string"
  }
}
```

### 11.2 결제 정보 조회
- **URL**: `GET /pg/payment/{paymentId}`
- **설명**: 특정 결제 정보 조회
- **응답**: 결제 정보

### 11.3 환불 요청
- **URL**: `POST /pg/refund`
- **설명**: 결제 환불 요청
- **요청 본문**:
```json
{
  "paymentId": "string",
  "reason": "string"
}
```
- **응답**:
```json
{
  "success": true,
  "refundId": "string",
  "message": "string"
}
```

---

## 12. Toss 연동

### 12.1 Toss 상품 업데이트
- **URL**: `POST /toss/`
- **설명**: Toss API를 통한 상품 정보 업데이트
- **응답**:
```json
{
  "success": true,
  "message": "string",
  "data": {
    "updatedItems": 0,
    "totalItems": 0
  }
}
```

---

## 13. 관리자 마이그레이션

### 13.1 사용자 데이터 암호화 마이그레이션
- **URL**: `POST /admin/migration/encrypt-user-data`
- **설명**: 사용자 데이터 암호화 마이그레이션 실행
- **응답**:
```json
{
  "totalUsers": 0,
  "processedUsers": 0,
  "successCount": 0,
  "errorCount": 0,
  "errors": ["string"]
}
```

### 13.2 마이그레이션 상태 조회
- **URL**: `GET /admin/migration/status`
- **설명**: 마이그레이션 진행 상태 조회
- **응답**:
```json
{
  "isCompleted": true,
  "totalUsers": 0,
  "processedUsers": 0,
  "lastUpdated": "datetime"
}
```

---

## 에러 코드

### HTTP 상태 코드
- `200`: 성공
- `201`: 생성 성공
- `400`: 잘못된 요청
- `401`: 인증 실패
- `403`: 권한 없음
- `404`: 리소스 없음
- `500`: 서버 내부 오류

### 비즈니스 에러 코드
- `USER_NOT_FOUND`: 사용자를 찾을 수 없음
- `INVALID_PASSWORD`: 잘못된 비밀번호
- `DUPLICATE_USER`: 중복된 사용자
- `INSUFFICIENT_POINTS`: 포인트 부족
- `INVALID_TOKEN`: 잘못된 토큰
- `PAYMENT_NOT_FOUND`: 결제 정보 없음
- `INQUIRY_LIMIT_EXCEEDED`: 문의 제한 초과

---

## 인증 및 권한

### JWT 토큰 사용
모든 보호된 API는 Authorization 헤더에 Bearer 토큰을 포함해야 합니다:
```
Authorization: Bearer <jwt_token>
```

### 권한 레벨
- `STUDENT`: 학생 권한
- `ADMIN`: 관리자 권한
- `COOPERATIVE`: 협동조합 권한

### 권한별 접근 가능 API
- **STUDENT**: 본인 정보 조회/수정, 본인 로그 조회, 문의 접수
- **ADMIN**: 모든 API 접근 가능
- **COOPERATIVE**: 사용자 조회, 거래 관리, 재고 관리

---

## 주의사항

1. **날짜 형식**: 모든 날짜는 `YYYY-MM-DD` 형식으로 전송
2. **시간 형식**: 모든 시간은 ISO 8601 형식 (`YYYY-MM-DDTHH:mm:ss`)으로 전송
3. **포인트**: 정수형으로 전송 (소수점 불가)
4. **파일 업로드**: 현재 지원하지 않음
5. **페이지네이션**: 대부분의 목록 API는 페이지네이션을 지원하지 않음 (전체 데이터 반환)

---

## 개발 환경 설정

### 필수 헤더
```
Content-Type: application/json; charset=UTF-8
Authorization: Bearer <jwt_token> (보호된 API의 경우)
```

### CORS 설정
개발 환경에서는 모든 origin에서의 요청을 허용하도록 설정되어 있습니다.

### 로깅
모든 API 요청/응답은 서버 로그에 기록됩니다. 개발 시 참고하시기 바랍니다. 