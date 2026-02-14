# Phase 3: Admin Dashboard 구현 계획

## 📋 개요

관리자가 주문, 상품, 재고를 관리할 수 있는 대시보드를 구축합니다.

**목표:**
- 관리자 인증 시스템 구현
- 주문 관리 기능 (조회, 상태 변경)
- 상품 관리 기능 (CRUD, 이미지 업로드)
- 재고 관리 및 히스토리 추적
- 통계 대시보드

**예상 소요 시간:** 8-10시간

---

## 🎯 구현 단계

### Step 1: 관리자 인증 시스템 (1-1.5시간)

**목표:** 관리자 로그인 및 세션 관리

#### 1.1 미들웨어 및 유틸리티
- `lib/auth/admin.ts` - 관리자 인증 유틸리티
  ```typescript
  // 기능:
  - checkAdminCredentials(username, password) - 환경변수와 비교
  - createAdminSession() - 세션 토큰 생성
  - verifyAdminSession(token) - 세션 검증
  - hashPassword() - 비밀번호 해싱
  ```

#### 1.2 API 라우트
- `app/api/admin/login/route.ts` - POST: 로그인
  ```typescript
  // 요청: { username, password }
  // 응답: { success, token }
  // 에러: 401 Unauthorized
  ```

- `app/api/admin/logout/route.ts` - POST: 로그아웃
  ```typescript
  // 세션 토큰 무효화
  ```

- `app/api/admin/verify/route.ts` - GET: 세션 검증
  ```typescript
  // 응답: { isAdmin: boolean }
  ```

#### 1.3 로그인 페이지
- `app/admin/login/page.tsx`
  - 사용자명/비밀번호 입력
  - 로그인 버튼
  - 에러 메시지 표시
  - 로그인 성공 시 `/admin/dashboard`로 리다이렉트

#### 1.4 미들웨어
- `middleware.ts` - 관리자 라우트 보호
  ```typescript
  // /admin/* 경로 보호
  // 세션 검증
  // 미인증 시 /admin/login으로 리다이렉트
  ```

**테스트 시나리오:**
- [ ] 올바른 자격증명으로 로그인 성공
- [ ] 잘못된 자격증명으로 로그인 실패
- [ ] 로그인 후 대시보드 접근 가능
- [ ] 로그아웃 후 로그인 페이지로 리다이렉트
- [ ] 미인증 상태에서 관리자 페이지 접근 차단

---

### Step 2: 관리자 레이아웃 및 네비게이션 (1시간)

**목표:** 관리자 페이지 공통 레이아웃 구축

#### 2.1 레이아웃
- `app/admin/(dashboard)/layout.tsx`
  - 사이드바 네비게이션
  - 상단 헤더 (관리자명, 로그아웃 버튼)
  - 메인 컨텐츠 영역

#### 2.2 네비게이션 메뉴
- **Dashboard** - `/admin/dashboard`
- **Orders** - `/admin/orders`
- **Products** - `/admin/products`
- **Inventory** - `/admin/inventory`

#### 2.3 컴포넌트
- `components/admin/sidebar.tsx` - 사이드바 네비게이션
- `components/admin/header.tsx` - 상단 헤더
- `components/admin/logout-button.tsx` - 로그아웃 버튼

**디자인:**
- 다크 모드 지원 (선택사항)
- 모바일 반응형 (햄버거 메뉴)
- 현재 페이지 하이라이트

---

### Step 3: 대시보드 홈 (1.5시간)

**목표:** 통계 및 요약 정보 표시

#### 3.1 API 라우트
- `app/api/admin/stats/route.ts` - GET: 통계 데이터
  ```typescript
  // 응답:
  {
    totalRevenue: number,        // 총 매출
    totalOrders: number,          // 총 주문 수
    pendingOrders: number,        // 대기 중 주문
    lowStockProducts: number,     // 재고 부족 상품
    recentOrders: Order[],        // 최근 주문 5개
    topProducts: Product[],       // 인기 상품 5개
    revenueByDate: {              // 일별 매출 (최근 7일)
      date: string,
      revenue: number
    }[]
  }
  ```

#### 3.2 대시보드 페이지
- `app/admin/(dashboard)/dashboard/page.tsx`
  - 통계 카드 (4개)
    - 총 매출 (Total Revenue)
    - 총 주문 수 (Total Orders)
    - 대기 중 주문 (Pending Orders)
    - 재고 부족 상품 (Low Stock)
  - 최근 주문 테이블
  - 인기 상품 목록
  - 매출 차트 (선택사항)

**컴포넌트:**
- `components/admin/stat-card.tsx` - 통계 카드
- `components/admin/recent-orders-table.tsx` - 최근 주문 테이블
- `components/admin/top-products-list.tsx` - 인기 상품 목록

---

### Step 4: 주문 관리 (2-2.5시간)

**목표:** 주문 조회, 필터링, 상태 변경

#### 4.1 API 라우트

**주문 목록 조회**
- `app/api/admin/orders/route.ts` - GET
  ```typescript
  // 쿼리 파라미터:
  {
    page?: number,              // 페이지 번호 (기본: 1)
    limit?: number,             // 페이지당 개수 (기본: 20)
    status?: string,            // 주문 상태 필터
    payment_status?: string,    // 결제 상태 필터
    search?: string,            // 검색어 (주문번호, 이름, 이메일)
    startDate?: string,         // 시작 날짜
    endDate?: string           // 종료 날짜
  }

  // 응답:
  {
    orders: Order[],
    total: number,
    page: number,
    totalPages: number
  }
  ```

**주문 상태 변경**
- `app/api/admin/orders/[orderId]/status/route.ts` - PATCH
  ```typescript
  // 요청: { status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' }
  // 응답: { success: boolean, order: Order }
  ```

**주문 상세 조회**
- `app/api/admin/orders/[orderId]/route.ts` - GET
  ```typescript
  // 응답: { order: Order, items: OrderItem[] }
  ```

#### 4.2 주문 목록 페이지
- `app/admin/(dashboard)/orders/page.tsx`
  - 필터 및 검색
    - 상태 드롭다운 (All, Pending, Confirmed, Processing, Shipped, Delivered, Cancelled)
    - 결제 상태 드롭다운 (All, Pending, Paid, Failed, Refunded)
    - 날짜 범위 선택
    - 검색 입력 (주문번호, 이름, 이메일)
  - 주문 테이블
    - 주문 번호
    - 고객 이름
    - 총 금액
    - 주문 상태
    - 결제 상태
    - 주문 날짜
    - 액션 (상세보기, 상태변경)
  - 페이지네이션

#### 4.3 주문 상세 페이지
- `app/admin/(dashboard)/orders/[orderId]/page.tsx`
  - 주문 정보
    - 주문 번호, 날짜, 상태
  - 고객 정보
    - 이름, 이메일, 전화번호
  - 배송 정보
    - 수령인, 주소, 배송 날짜/시간
  - 주문 상품 목록
  - 결제 정보
  - 상태 변경 버튼
    - Pending → Confirmed
    - Confirmed → Processing
    - Processing → Shipped
    - Shipped → Delivered
    - Cancel Order (취소)

**컴포넌트:**
- `components/admin/orders-filter.tsx` - 필터 컴포넌트
- `components/admin/orders-table.tsx` - 주문 테이블
- `components/admin/order-status-badge.tsx` - 상태 뱃지
- `components/admin/order-status-changer.tsx` - 상태 변경 컴포넌트

**테스트 시나리오:**
- [ ] 주문 목록 조회 (페이지네이션)
- [ ] 상태별 필터링
- [ ] 검색 기능 (주문번호, 이름, 이메일)
- [ ] 주문 상세 조회
- [ ] 주문 상태 변경

---

### Step 5: 상품 관리 (2.5-3시간)

**목표:** 상품 CRUD 및 이미지 업로드

#### 5.1 API 라우트

**상품 목록 조회**
- `app/api/admin/products/route.ts` - GET
  ```typescript
  // 쿼리 파라미터:
  {
    page?: number,
    limit?: number,
    category?: string,
    is_active?: boolean,
    search?: string
  }

  // 응답:
  {
    products: Product[],
    total: number,
    page: number,
    totalPages: number
  }
  ```

**상품 생성**
- `app/api/admin/products/route.ts` - POST
  ```typescript
  // 요청:
  {
    name: string,
    description: string,
    price: number,
    category: string,
    stock_quantity: number,
    is_active: boolean,
    image_url?: string
  }

  // 응답: { success: boolean, product: Product }
  ```

**상품 수정**
- `app/api/admin/products/[productId]/route.ts` - PATCH
  ```typescript
  // 요청: 업데이트할 필드들
  // 응답: { success: boolean, product: Product }
  ```

**상품 삭제**
- `app/api/admin/products/[productId]/route.ts` - DELETE
  ```typescript
  // 응답: { success: boolean }
  // 주의: 주문에 연결된 상품은 삭제 불가 (is_active를 false로 변경)
  ```

**이미지 업로드**
- `app/api/admin/products/upload/route.ts` - POST
  ```typescript
  // 요청: FormData (이미지 파일)
  // 응답: { success: boolean, imageUrl: string }
  // Supabase Storage 'products' 버킷 사용
  ```

#### 5.2 상품 목록 페이지
- `app/admin/(dashboard)/products/page.tsx`
  - 필터 및 검색
    - 카테고리 드롭다운
    - 활성/비활성 필터
    - 검색 입력
  - 상품 테이블
    - 이미지 썸네일
    - 상품명
    - 카테고리
    - 가격
    - 재고
    - 활성 상태
    - 액션 (수정, 삭제)
  - "Add New Product" 버튼
  - 페이지네이션

#### 5.3 상품 추가/수정 페이지
- `app/admin/(dashboard)/products/new/page.tsx` - 새 상품 추가
- `app/admin/(dashboard)/products/[productId]/edit/page.tsx` - 상품 수정

**폼 필드:**
- 상품명 (필수)
- 설명 (필수)
- 가격 (필수, 숫자)
- 카테고리 (드롭다운: bouquet, arrangement, plant, gift)
- 재고 수량 (필수, 숫자)
- 활성 상태 (체크박스)
- 이미지 업로드
  - 드래그 앤 드롭 또는 파일 선택
  - 이미지 미리보기
  - 기존 이미지 삭제

**검증:**
- 모든 필수 필드 입력 확인
- 가격 > 0
- 재고 수량 >= 0
- 이미지 파일 타입 (jpg, png, webp)
- 이미지 파일 크기 (최대 5MB)

**컴포넌트:**
- `components/admin/product-form.tsx` - 상품 폼
- `components/admin/image-upload.tsx` - 이미지 업로드 컴포넌트
- `components/admin/products-table.tsx` - 상품 테이블

**테스트 시나리오:**
- [ ] 상품 목록 조회
- [ ] 상품 추가 (이미지 포함)
- [ ] 상품 수정
- [ ] 상품 삭제 (또는 비활성화)
- [ ] 이미지 업로드
- [ ] 필터 및 검색

---

### Step 6: 재고 관리 (1.5-2시간)

**목표:** 재고 수량 조정 및 히스토리 추적

#### 6.1 API 라우트

**재고 조정**
- `app/api/admin/inventory/adjust/route.ts` - POST
  ```typescript
  // 요청:
  {
    product_id: string,
    quantity_change: number,    // 양수 또는 음수
    reason: string,             // 'purchase' | 'sale' | 'return' | 'adjustment' | 'damaged'
    notes?: string
  }

  // 응답: { success: boolean, stock_history: StockHistory }
  // 동작:
  // 1. products 테이블의 stock_quantity 업데이트
  // 2. stock_history 테이블에 기록 추가
  ```

**재고 히스토리 조회**
- `app/api/admin/inventory/history/route.ts` - GET
  ```typescript
  // 쿼리 파라미터:
  {
    product_id?: string,
    page?: number,
    limit?: number,
    startDate?: string,
    endDate?: string
  }

  // 응답:
  {
    history: StockHistory[],
    total: number,
    page: number,
    totalPages: number
  }
  ```

**재고 부족 상품 조회**
- `app/api/admin/inventory/low-stock/route.ts` - GET
  ```typescript
  // 쿼리 파라미터:
  {
    threshold?: number  // 기본값: 10
  }

  // 응답: { products: Product[] }
  ```

#### 6.2 재고 관리 페이지
- `app/admin/(dashboard)/inventory/page.tsx`
  - 재고 현황 섹션
    - 상품 목록 (이름, 현재 재고, 액션)
    - 빠른 조정 버튼 (+10, +1, -1, -10)
    - "Adjust Stock" 버튼 → 모달 오픈
  - 재고 부족 알림 섹션
    - 재고 10개 이하 상품 목록
    - 경고 뱃지
  - 재고 히스토리 섹션
    - 최근 재고 변경 내역
    - 날짜, 상품, 변경량, 사유, 담당자

#### 6.3 재고 조정 모달
- `components/admin/inventory-adjust-modal.tsx`
  - 상품 선택 (드롭다운 또는 자동 완성)
  - 조정 수량 입력 (양수/음수)
  - 사유 선택 (Purchase, Sale, Return, Adjustment, Damaged)
  - 메모 (선택사항)
  - "Adjust Stock" 버튼

**컴포넌트:**
- `components/admin/inventory-table.tsx` - 재고 테이블
- `components/admin/low-stock-alert.tsx` - 재고 부족 알림
- `components/admin/stock-history-table.tsx` - 히스토리 테이블

**테스트 시나리오:**
- [ ] 재고 수량 증가
- [ ] 재고 수량 감소
- [ ] 재고 히스토리 조회
- [ ] 재고 부족 상품 조회
- [ ] 재고 조정 후 stock_history 기록 확인

---

## 📁 파일 구조

```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx                    # 로그인 페이지
│   └── (dashboard)/
│       ├── layout.tsx                   # 관리자 레이아웃
│       ├── dashboard/
│       │   └── page.tsx                 # 대시보드 홈
│       ├── orders/
│       │   ├── page.tsx                 # 주문 목록
│       │   └── [orderId]/
│       │       └── page.tsx             # 주문 상세
│       ├── products/
│       │   ├── page.tsx                 # 상품 목록
│       │   ├── new/
│       │   │   └── page.tsx             # 상품 추가
│       │   └── [productId]/
│       │       └── edit/
│       │           └── page.tsx         # 상품 수정
│       └── inventory/
│           └── page.tsx                 # 재고 관리
│
├── api/
│   └── admin/
│       ├── login/
│       │   └── route.ts
│       ├── logout/
│       │   └── route.ts
│       ├── verify/
│       │   └── route.ts
│       ├── stats/
│       │   └── route.ts
│       ├── orders/
│       │   ├── route.ts                 # GET: 목록 조회
│       │   └── [orderId]/
│       │       ├── route.ts             # GET: 상세 조회
│       │       └── status/
│       │           └── route.ts         # PATCH: 상태 변경
│       ├── products/
│       │   ├── route.ts                 # GET: 목록, POST: 생성
│       │   ├── upload/
│       │   │   └── route.ts             # POST: 이미지 업로드
│       │   └── [productId]/
│       │       └── route.ts             # GET, PATCH, DELETE
│       └── inventory/
│           ├── adjust/
│           │   └── route.ts             # POST: 재고 조정
│           ├── history/
│           │   └── route.ts             # GET: 히스토리
│           └── low-stock/
│               └── route.ts             # GET: 재고 부족 상품

components/
└── admin/
    ├── sidebar.tsx
    ├── header.tsx
    ├── logout-button.tsx
    ├── stat-card.tsx
    ├── recent-orders-table.tsx
    ├── top-products-list.tsx
    ├── orders-filter.tsx
    ├── orders-table.tsx
    ├── order-status-badge.tsx
    ├── order-status-changer.tsx
    ├── product-form.tsx
    ├── image-upload.tsx
    ├── products-table.tsx
    ├── inventory-table.tsx
    ├── inventory-adjust-modal.tsx
    ├── low-stock-alert.tsx
    └── stock-history-table.tsx

lib/
├── auth/
│   └── admin.ts                         # 관리자 인증 유틸리티
└── supabase/
    └── storage.ts                       # Storage 유틸리티 (이미지 업로드)

middleware.ts                             # 관리자 라우트 보호
```

---

## 🔐 보안 고려사항

1. **인증**
   - 환경변수에 저장된 자격증명 사용
   - 비밀번호 해싱 (bcrypt)
   - 세션 토큰 암호화 (JWT)
   - 토큰 만료 시간 설정 (24시간)

2. **권한 검증**
   - 모든 관리자 API 엔드포인트에서 세션 검증
   - 미들웨어로 라우트 보호
   - Admin client (service role key) 사용

3. **입력 검증**
   - Zod 스키마로 모든 입력 검증
   - SQL Injection 방지 (Supabase ORM 사용)
   - XSS 방지 (React 자동 이스케이핑)

4. **파일 업로드**
   - 허용된 파일 타입만 업로드
   - 파일 크기 제한
   - 파일명 sanitization
   - Supabase Storage RLS 정책 설정

---

## 🎨 UI/UX 가이드라인

1. **일관성**
   - 고객 페이지와 다른 색상 스키마 사용 (예: 블루 계열)
   - shadcn/ui 컴포넌트 사용
   - 통일된 간격 및 타이포그래피

2. **접근성**
   - 키보드 네비게이션 지원
   - ARIA 레이블
   - 색상 대비 (WCAG AA 준수)

3. **반응형 디자인**
   - 모바일, 태블릿, 데스크톱 지원
   - 모바일에서는 사이드바 → 햄버거 메뉴

4. **로딩 및 에러 상태**
   - 스켈레톤 로더
   - 에러 메시지 명확하게 표시
   - Toast 알림 (성공/실패)

---

## 🧪 테스트 계획

### 단위 테스트
- [ ] 관리자 인증 함수
- [ ] API 엔드포인트 (Mock 데이터)
- [ ] 재고 조정 로직

### 통합 테스트
- [ ] 로그인 → 대시보드 플로우
- [ ] 주문 상태 변경 플로우
- [ ] 상품 생성 → 이미지 업로드 플로우
- [ ] 재고 조정 → 히스토리 기록 플로우

### E2E 테스트 (선택사항)
- [ ] Playwright로 전체 관리자 플로우 테스트

---

## 📊 데이터베이스 쿼리 최적화

1. **인덱스 추가 (선택사항)**
   ```sql
   -- 주문 조회 성능 향상
   CREATE INDEX idx_orders_status ON orders(status);
   CREATE INDEX idx_orders_payment_status ON orders(payment_status);
   CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

   -- 재고 히스토리 조회 성능 향상
   CREATE INDEX idx_stock_history_product_id ON stock_history(product_id);
   CREATE INDEX idx_stock_history_created_at ON stock_history(created_at DESC);
   ```

2. **쿼리 최적화**
   - 페이지네이션 사용
   - 필요한 컬럼만 SELECT
   - JOIN 최소화

---

## 🚀 배포 전 체크리스트

- [ ] 환경변수 설정 (ADMIN_USERNAME, ADMIN_PASSWORD)
- [ ] Supabase RLS 정책 확인
- [ ] Supabase Storage 버킷 생성 ('products')
- [ ] 이미지 업로드 용량 제한 설정
- [ ] 관리자 페이지 접근 제한 확인
- [ ] 모든 API 엔드포인트 세션 검증 확인
- [ ] 에러 핸들링 확인
- [ ] 로딩 상태 확인

---

## 📝 추가 고려사항

1. **추후 개선 사항**
   - 이메일 알림 (주문 확인, 배송 시작)
   - 엑셀 내보내기 (주문, 상품 목록)
   - 고급 통계 (차트, 그래프)
   - 다중 관리자 계정 지원
   - 역할 기반 권한 관리 (Role-Based Access Control)

2. **성능 최적화**
   - React Query로 데이터 캐싱
   - 이미지 최적화 (Next.js Image)
   - 코드 스플리팅

3. **모니터링**
   - 에러 로깅 (Sentry)
   - 분석 (Google Analytics)

---

## 📅 구현 순서 요약

1. **Day 1 (4-5시간)**
   - Step 1: 관리자 인증 시스템
   - Step 2: 관리자 레이아웃
   - Step 3: 대시보드 홈

2. **Day 2 (4-5시간)**
   - Step 4: 주문 관리
   - Step 5: 상품 관리 (시작)

3. **Day 3 (선택사항, 필요시)**
   - Step 5: 상품 관리 (완료)
   - Step 6: 재고 관리
   - 테스트 및 버그 수정

---

**다음 단계:** Step 1부터 순차적으로 구현 시작
