# ✅ Joy Flower 프로덕션 체크리스트

배포 전에 반드시 확인해야 할 모든 항목들입니다.

## 🔐 보안

### 환경 변수
- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있음
- [ ] GitHub에 민감한 정보(API 키, 비밀번호)가 커밋되지 않았음
- [ ] 프로덕션 환경 변수가 Vercel에 올바르게 설정됨

### 관리자 계정
- [ ] `ADMIN_PASSWORD`를 강력한 비밀번호로 변경 (최소 12자, 대소문자+숫자+특수문자)
- [ ] `JWT_SECRET`을 32자 이상의 랜덤 문자열로 변경
- [ ] 관리자 계정 로그인 테스트 완료

### API 키
- [ ] Stripe Secret Key가 노출되지 않음 (서버에서만 사용)
- [ ] Supabase Service Role Key가 노출되지 않음
- [ ] 모든 민감한 키에 `NEXT_PUBLIC_` 접두사가 없음 (클라이언트 노출 방지)

---

## 🗄️ 데이터베이스

### Supabase 설정
- [ ] Supabase 프로젝트 생성 완료
- [ ] `database-schema.sql` 실행 완료
- [ ] 모든 테이블 생성 확인:
  - [ ] `products`
  - [ ] `orders`
  - [ ] `order_items`
  - [ ] `stock_history` (선택사항)

### Row Level Security (RLS)
- [ ] `products` 테이블 RLS 활성화
- [ ] `orders` 테이블 RLS 활성화
- [ ] `order_items` 테이블 RLS 활성화
- [ ] RLS 정책이 올바르게 설정됨:
  - 고객: 활성 상품만 조회 가능
  - 관리자: 모든 데이터 관리 가능

### 데이터
- [ ] 최소 3개 이상의 테스트 제품 추가
- [ ] 제품 이미지 URL이 유효함
- [ ] 제품 가격과 재고가 올바르게 설정됨

---

## 💳 Stripe

### API 키
- [ ] Stripe 계정 생성 완료
- [ ] Test mode API 키 발급:
  - [ ] Publishable key (`pk_test_...`)
  - [ ] Secret key (`sk_test_...`)
- [ ] Vercel에 환경 변수 설정 완료

### 웹훅
- [ ] Stripe 웹훅 엔드포인트 등록 완료
- [ ] 웹훅 URL: `https://your-domain.vercel.app/api/webhooks/stripe`
- [ ] 웹훅 이벤트 선택 완료:
  - [ ] `checkout.session.completed`
  - [ ] `payment_intent.succeeded`
  - [ ] `payment_intent.payment_failed`
- [ ] Webhook Secret 발급 및 Vercel에 설정 완료

### 테스트
- [ ] 테스트 카드(`4242 4242 4242 4242`)로 결제 테스트
- [ ] 주문 생성 확인
- [ ] 주문 상태가 `pending`에서 `confirmed`로 변경됨
- [ ] 웹훅 이벤트 수신 확인 (Stripe Dashboard)

---

## 🚀 Vercel 배포

### 프로젝트 설정
- [ ] Vercel 계정 생성 및 GitHub 연동
- [ ] joy-flower 리포지토리 import 완료
- [ ] Framework: Next.js로 자동 감지됨

### 환경 변수
모든 환경 변수가 Vercel에 설정되었는지 확인:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL` (프로덕션 URL로 업데이트)
- [ ] `ADMIN_USERNAME`
- [ ] `ADMIN_PASSWORD` (강력한 비밀번호로 변경)
- [ ] `JWT_SECRET` (32자 이상 랜덤 문자열)

### 빌드
- [ ] 로컬에서 `npm run build` 성공
- [ ] Vercel에서 첫 배포 성공
- [ ] 배포 URL 확인 및 복사
- [ ] `NEXT_PUBLIC_APP_URL` 업데이트 후 재배포

---

## 🧪 기능 테스트

### 고객 기능
- [ ] 홈페이지 로딩 (`/`)
- [ ] 제품 목록 표시
- [ ] 제품 상세 페이지 (`/products/[id]`)
- [ ] 장바구니 추가
- [ ] 장바구니 페이지 (`/checkout`)
- [ ] Stripe 체크아웃 페이지 리다이렉트
- [ ] 테스트 결제 완료
- [ ] 주문 성공 페이지 (`/order/success`)
- [ ] 주문 상세 정보 표시
- [ ] 주문 조회 페이지 (`/order/lookup`)
- [ ] 주문 번호로 조회 성공

### 관리자 기능
- [ ] 로그인 페이지 접근 (`/admin/login`)
- [ ] 관리자 로그인 성공
- [ ] 미들웨어 보호 작동 (미인증 시 로그인 페이지로 리다이렉트)
- [ ] 대시보드 (`/admin/dashboard`)
  - [ ] 통계 카드 표시 (매출, 주문, 재고)
  - [ ] 최근 주문 테이블
  - [ ] 인기 상품 목록
- [ ] 주문 관리 (`/admin/orders`)
  - [ ] 주문 목록 표시
  - [ ] 필터링 (상태, 결제상태)
  - [ ] 검색 기능
  - [ ] 페이지네이션
- [ ] 주문 상세 (`/admin/orders/[id]`)
  - [ ] 주문 정보 표시
  - [ ] 주문 상태 변경
- [ ] 제품 관리 (`/admin/products`)
  - [ ] 제품 목록 표시
  - [ ] 필터링 (카테고리, 상태)
  - [ ] 제품 추가 (`/admin/products/new`)
  - [ ] 제품 수정 (`/admin/products/[id]/edit`)
  - [ ] 제품 삭제
- [ ] 재고 관리 (`/admin/inventory`)
  - [ ] 재고 목록 표시
  - [ ] 재고 부족 알림
  - [ ] 빠른 조정 버튼
  - [ ] 상세 조정 다이얼로그
- [ ] 로그아웃 성공

---

## 📱 반응형 디자인

### 모바일 (375px - 767px)
- [ ] 홈페이지 레이아웃
- [ ] 제품 카드 그리드
- [ ] 장바구니 UI
- [ ] 관리자 사이드바 (햄버거 메뉴)

### 태블릿 (768px - 1023px)
- [ ] 2열 제품 그리드
- [ ] 관리자 테이블 스크롤

### 데스크톱 (1024px+)
- [ ] 3-4열 제품 그리드
- [ ] 관리자 사이드바 고정
- [ ] 전체 테이블 표시

---

## 🔍 SEO 및 성능

### 메타 태그
- [ ] 각 페이지에 적절한 `<title>` 태그
- [ ] Open Graph 태그 설정 (선택사항)
- [ ] Favicon 설정

### 성능
- [ ] Lighthouse 점수 확인:
  - [ ] Performance > 80
  - [ ] Accessibility > 90
  - [ ] Best Practices > 90
  - [ ] SEO > 90
- [ ] 이미지 최적화 (Next.js Image 사용)
- [ ] 코드 분할 및 lazy loading

---

## 🐛 오류 처리

### 사용자 에러 메시지
- [ ] 결제 실패 시 명확한 메시지
- [ ] 주문 조회 실패 시 안내
- [ ] 네트워크 오류 처리
- [ ] 404 페이지

### 로깅
- [ ] Vercel Functions 로그 확인
- [ ] Supabase 로그 확인
- [ ] Stripe 웹훅 이벤트 로그

---

## 📊 모니터링

### 설정
- [ ] Vercel Analytics 활성화
- [ ] Sentry 또는 오류 추적 도구 설정 (선택사항)

### 정기 확인
- [ ] 일일 주문 현황
- [ ] 재고 부족 알림
- [ ] 결제 실패율
- [ ] 페이지 로딩 시간

---

## 🚨 긴급 연락처 및 백업

### 문서화
- [ ] 관리자 로그인 정보 안전한 곳에 저장
- [ ] API 키 백업
- [ ] 데이터베이스 백업 계획

### 복구 계획
- [ ] Vercel 롤백 방법 숙지
- [ ] Supabase 백업 복원 방법 숙지
- [ ] Stripe 테스트/프로덕션 모드 전환 방법

---

## ✅ 최종 승인

모든 항목을 확인했다면:

- [ ] 프로덕션 배포 승인
- [ ] 이해관계자에게 배포 알림
- [ ] 모니터링 시작

---

## 🎉 배포 완료!

축하합니다! Joy Flower가 프로덕션에 성공적으로 배포되었습니다.

**배포 날짜**: _______________  
**배포자**: _______________  
**프로덕션 URL**: _______________  

**다음 단계**:
1. 첫 24시간 집중 모니터링
2. 실제 사용자 피드백 수집
3. 필요시 핫픽스 준비
