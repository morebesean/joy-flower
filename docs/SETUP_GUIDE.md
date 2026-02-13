# 🚀 Joy-Flower 설정 가이드

Joy-Flower 이커머스 플랫폼을 설정하는 완벽한 단계별 가이드입니다.

## 📋 목차

1. [Supabase 설정](#supabase-설정)
2. [Stripe 설정](#stripe-설정)
3. [로컬 개발 환경](#로컬-개발-환경)
4. [배포하기](#배포하기)

---

## 1. Supabase 설정

### 1-1. Supabase 프로젝트 생성

1. [https://database.new](https://database.new) 또는 [https://supabase.com](https://supabase.com)에 접속합니다
2. 계정이 없다면 회원가입을 진행합니다 (GitHub 계정으로 간편 가입 가능)
3. **"New Project"** 버튼을 클릭합니다
4. 프로젝트 정보를 입력합니다:
   - **Name**: `joy-flower` (또는 원하는 이름)
   - **Database Password**: 안전한 비밀번호를 입력하고 **반드시 저장**하세요
   - **Region**: 괌과 가까운 지역 선택
     - 추천: `Northeast Asia (Tokyo)` 또는 `Southeast Asia (Singapore)`
   - **Pricing Plan**: **Free** 선택
5. **"Create new project"** 버튼을 클릭합니다
6. 프로젝트 생성에 약 2-3분 소요됩니다

### 1-2. API 키 가져오기

프로젝트가 생성되면:

1. 대시보드 왼쪽 하단의 **⚙️ Project Settings** 아이콘을 클릭합니다
2. 왼쪽 메뉴에서 **API**를 선택합니다
3. **Project API keys** 섹션에서 다음 값들을 복사합니다:

```
Project URL → NEXT_PUBLIC_SUPABASE_URL
anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
```

4. 아래로 스크롤하여 **service_role** 키를 찾습니다
5. **"Reveal"** 버튼을 클릭하고 복사합니다 → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **중요**: `service_role` 키는 절대 클라이언트 코드에 노출하면 안 됩니다!

> **참고**: 최신 Supabase는 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 형식(`sb_publishable_xxx`)도 제공하지만, `anon` 키도 여전히 사용 가능합니다.

### 1-3. 데이터베이스 스키마 생성

1. 대시보드 왼쪽 메뉴에서 **SQL Editor**를 클릭합니다
2. **"New query"** 버튼을 클릭합니다
3. `docs/database-schema.sql` 파일의 전체 내용을 복사합니다
4. SQL Editor에 붙여넣기 합니다
5. **"Run"** 버튼을 클릭하거나 `Cmd/Ctrl + Enter`를 눌러 실행합니다
6. 성공 메시지가 표시되면 완료입니다

**테이블 확인:**
1. 왼쪽 메뉴에서 **Table Editor**를 클릭합니다
2. 다음 테이블들이 생성되었는지 확인:
   - `products` (상품)
   - `orders` (주문)
   - `order_items` (주문 항목)
   - `stock_history` (재고 이력)

### 1-4. Storage 버킷 생성

상품 이미지를 저장할 Storage 버킷을 생성합니다:

1. 왼쪽 메뉴에서 **Storage**를 클릭합니다
2. **"New Bucket"** 버튼을 클릭합니다
3. 버킷 설정:
   - **Name**: `product-images` (정확히 이 이름으로 입력)
   - **Public bucket**: ✅ 체크 (이미지를 웹에서 접근 가능하도록)
   - **File size limit**: 5MB (기본값 유지)
   - **Allowed MIME types**: `image/*` (이미지 파일만 허용)
4. **"Create bucket"** 버튼을 클릭합니다

**폴더 구조 생성 (선택사항):**
1. 생성된 `product-images` 버킷을 클릭합니다
2. **"Upload"** → **"Create folder"**를 선택하여 다음 폴더들을 생성:
   - `original` (원본 이미지)
   - `thumbnails` (썸네일)

### 1-5. Row Level Security (RLS) 확인

데이터베이스 스키마를 실행하면 RLS 정책이 자동으로 설정됩니다.

**확인 방법:**
1. **Table Editor**에서 `products` 테이블을 클릭합니다
2. 상단의 **🔒 RLS policies** 버튼을 클릭합니다
3. 다음 정책들이 있는지 확인:
   - "Anyone can view active products"
   - "Authenticated users can manage products"

---

## 2. Stripe 설정

### 2-1. Stripe 계정 생성

1. [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)에 접속합니다
2. 이메일과 비밀번호로 가입하거나 Google 계정으로 가입합니다
3. 이메일 인증을 완료합니다
4. 계정이 생성되면 자동으로 **테스트 모드(Test mode)**로 시작됩니다

### 2-2. API 키 가져오기

대시보드에서 API 키를 가져옵니다:

1. 상단 오른쪽의 **"Test mode"** 토글이 켜져 있는지 확인합니다
   - 🟢 **Test mode** = 테스트 환경 (무료, 실제 결제 없음)
   - 🔴 **Live mode** = 실제 운영 환경

2. 왼쪽 메뉴에서 **Developers**를 클릭합니다
3. **API keys** 탭을 선택합니다
4. 다음 키들을 복사합니다:

```
Publishable key → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
(pk_test_로 시작)

Secret key → STRIPE_SECRET_KEY
(sk_test_로 시작)
```

5. Secret key는 **"Reveal test key"** 버튼을 클릭해야 표시됩니다

⚠️ **중요**: Secret key는 절대 프론트엔드 코드나 Git에 노출하면 안 됩니다!

### 2-3. 결제 수단 설정

1. 왼쪽 메뉴에서 **Settings**를 클릭합니다
2. **Payment methods**를 선택합니다
3. 다음 결제 수단들을 활성화합니다:
   - ✅ **Cards** (Visa, Mastercard, Amex)
   - ✅ **Apple Pay** (선택사항)
   - ✅ **Google Pay** (선택사항)

### 2-4. 테스트 카드 번호

개발 중에는 다음 테스트 카드를 사용할 수 있습니다:

| 카드 번호 | 브랜드 | 결과 |
|----------|-------|------|
| `4242 4242 4242 4242` | Visa | 성공 |
| `4000 0025 0000 3155` | Visa (3D Secure) | 인증 필요 |
| `4000 0000 0000 9995` | Visa | 거부됨 |
| `5555 5555 5555 4444` | Mastercard | 성공 |

**추가 정보:**
- **만료일**: 미래의 아무 날짜 (예: `12/28`)
- **CVC**: 아무 3자리 숫자 (예: `123`)
- **우편번호**: 아무 5자리 숫자 (예: `12345`)

### 2-5. 웹훅 설정 (배포 후)

⚠️ **주의**: 이 단계는 Vercel에 배포한 후에 진행합니다.

**배포 후 설정:**

1. **Developers** > **Webhooks** 탭으로 이동합니다
2. **"Add endpoint"** 또는 **"Create an event destination"** 버튼을 클릭합니다
3. 웹훅 설정:
   - **Endpoint URL**: `https://your-domain.vercel.app/api/webhooks/stripe`
   - **Description**: `Joy-Flower production webhook` (선택사항)
4. **"Select events"** 또는 **"Continue"**를 클릭합니다
5. 수신할 이벤트를 선택합니다:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
6. **"Add endpoint"** 버튼을 클릭합니다
7. 생성된 엔드포인트를 클릭하고 **"Signing secret"**을 복사합니다
   - `whsec_`로 시작하는 키 → `STRIPE_WEBHOOK_SECRET`

**로컬 개발용 웹훅 (선택사항):**

Stripe CLI를 설치하면 로컬에서 웹훅을 테스트할 수 있습니다:

```bash
# Stripe CLI 설치 (Mac)
brew install stripe/stripe-cli/stripe

# 로그인
stripe login

# 로컬 웹훅 포워딩
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

터미널에 표시되는 `whsec_` 키를 `.env.local`에 추가합니다.

---

## 3. 로컬 개발 환경

### 3-1. 의존성 설치

프로젝트 루트 디렉토리에서:

```bash
npm install
```

### 3-2. 환경 변수 설정

1. `.env.local` 파일을 엽니다
2. 앞서 복사한 API 키들을 입력합니다:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe 설정
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...

# 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 관리자 설정 (변경 권장)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme123!
```

3. 파일을 저장합니다

### 3-3. 데이터베이스 연결 테스트

간단한 테스트 스크립트를 만들어 연결을 확인합니다:

**test-connection.ts** 파일 생성:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 중...')

  const { data, error } = await supabase.from('products').select('*')

  if (error) {
    console.error('❌ 연결 실패:', error.message)
  } else {
    console.log('✅ 연결 성공! 상품 수:', data.length)
    console.log('상품 목록:', data)
  }
}

testConnection()
```

실행:

```bash
npx tsx test-connection.ts
```

성공 시 샘플 상품 데이터가 표시됩니다.

### 3-4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

**확인 사항:**
- ✅ Joy-Flower 랜딩 페이지가 표시됨
- ✅ 3개의 테스트 상품 카드가 보임
- ✅ "Add to Cart" 버튼 작동
- ✅ 장바구니에 상품 추가 시 카운트 증가
- ✅ 총 금액이 자동 계산됨

---

## 4. 배포하기

### 4-1. GitHub에 코드 푸시

```bash
# Git 저장소 초기화 (이미 되어 있음)
git status

# 모든 변경사항 커밋
git add .
git commit -m "준비 완료: Supabase와 Stripe 설정 완료"

# GitHub 저장소 생성 후
git remote add origin https://github.com/your-username/joy-flower.git
git branch -M main
git push -u origin main
```

### 4-2. Vercel에 배포

1. [https://vercel.com](https://vercel.com)에 접속합니다
2. GitHub 계정으로 로그인합니다
3. **"Add New..."** → **"Project"**를 클릭합니다
4. GitHub 저장소 목록에서 `joy-flower`를 찾아 **"Import"**를 클릭합니다
5. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (기본값)

6. **Environment Variables** 섹션을 펼칩니다
7. `.env.local`의 모든 환경 변수를 추가합니다:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET (일단 비워두기)
NEXT_PUBLIC_APP_URL (나중에 업데이트)
ADMIN_USERNAME
ADMIN_PASSWORD
```

8. **"Deploy"** 버튼을 클릭합니다
9. 약 2-3분 후 배포 완료!

### 4-3. 배포 후 설정

**1. 앱 URL 업데이트:**

1. Vercel에서 배포된 URL을 복사합니다 (예: `https://joy-flower.vercel.app`)
2. Vercel 프로젝트의 **Settings** > **Environment Variables**로 이동
3. `NEXT_PUBLIC_APP_URL` 값을 프로덕션 URL로 업데이트합니다
4. **"Redeploy"**를 클릭하여 다시 배포합니다

**2. Stripe 웹훅 설정:**

1. Stripe Dashboard > **Developers** > **Webhooks**로 이동
2. **"Add endpoint"** 클릭
3. Endpoint URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. 이벤트 선택 후 생성
5. **Signing secret** 복사
6. Vercel의 Environment Variables에 `STRIPE_WEBHOOK_SECRET` 추가
7. **"Redeploy"**

**3. Supabase URL 허용 목록 (선택사항):**

1. Supabase Dashboard > **Authentication** > **URL Configuration**
2. **Site URL**: `https://your-domain.vercel.app` 추가
3. **Redirect URLs**: 필요한 콜백 URL 추가

---

## 🎯 완료 체크리스트

배포가 완료되면 다음 사항들을 확인하세요:

### Supabase
- [ ] 프로젝트 생성 완료
- [ ] API 키 3개 획득 (URL, anon, service_role)
- [ ] 데이터베이스 스키마 실행 (4개 테이블)
- [ ] Storage 버킷 생성 (`product-images`)
- [ ] 샘플 데이터 확인 (5개 상품)

### Stripe
- [ ] 테스트 모드 계정 생성
- [ ] API 키 2개 획득 (Publishable, Secret)
- [ ] 결제 수단 활성화 (Cards)
- [ ] 테스트 카드로 결제 테스트
- [ ] 웹훅 엔드포인트 등록 (배포 후)

### 로컬 개발
- [ ] 의존성 설치 완료
- [ ] 환경 변수 설정 완료
- [ ] 데이터베이스 연결 테스트 성공
- [ ] 개발 서버 실행 확인
- [ ] 테스트 페이지 작동 확인

### 배포
- [ ] GitHub에 코드 푸시
- [ ] Vercel 배포 성공
- [ ] 환경 변수 프로덕션 설정
- [ ] 프로덕션 URL 업데이트
- [ ] Stripe 웹훅 프로덕션 설정

---

## 🆘 문제 해결

### "Supabase 연결 실패"

**증상**: API 요청 시 401 Unauthorized 또는 연결 오류

**해결 방법**:
1. `.env.local` 파일의 `NEXT_PUBLIC_SUPABASE_URL` 확인
   - `https://`로 시작하고 `.supabase.co`로 끝나는지 확인
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 확인
   - `eyJ`로 시작하는 긴 문자열인지 확인
3. 개발 서버 재시작: `Ctrl+C` 후 `npm run dev`
4. Supabase 프로젝트가 일시 중지되지 않았는지 확인

### "Stripe 체크아웃 작동 안 함"

**증상**: "결제하기" 버튼 클릭 시 오류 발생

**해결 방법**:
1. 브라우저 콘솔에서 오류 메시지 확인
2. `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`가 `pk_test_`로 시작하는지 확인
3. `STRIPE_SECRET_KEY`가 `sk_test_`로 시작하는지 확인
4. 테스트 모드가 활성화되어 있는지 Stripe Dashboard에서 확인

### "이미지 업로드 실패"

**증상**: 관리자 페이지에서 이미지 업로드 시 오류

**해결 방법**:
1. Storage 버킷 이름이 정확히 `product-images`인지 확인
2. 버킷이 **Public**으로 설정되어 있는지 확인
3. 파일 크기가 5MB 이하인지 확인
4. 이미지 파일 형식 확인 (JPG, PNG, WebP 등)

### "웹훅 이벤트 수신 안 됨"

**증상**: 결제 후 주문 상태가 업데이트되지 않음

**해결 방법**:
1. Stripe Dashboard > **Developers** > **Webhooks** > **Events** 확인
2. 웹훅 엔드포인트 URL이 정확한지 확인
3. `STRIPE_WEBHOOK_SECRET`가 올바른지 확인
4. Vercel 로그에서 웹훅 요청 확인:
   - Vercel Dashboard > **Deployments** > 최근 배포 > **Functions** 탭

### "환경 변수가 적용 안 됨"

**해결 방법**:
1. 로컬 개발: `.env.local` 파일 저장 후 서버 재시작
2. Vercel 배포: 환경 변수 추가 후 **Redeploy** 필수
3. 변수 이름 앞의 `NEXT_PUBLIC_` 접두사 확인
   - 클라이언트에서 사용: `NEXT_PUBLIC_` 필요
   - 서버에서만 사용: `NEXT_PUBLIC_` 불필요

---

## 📚 추가 리소스

### 공식 문서
- [Supabase 문서](https://supabase.com/docs)
- [Stripe 문서](https://docs.stripe.com)
- [Next.js 문서](https://nextjs.org/docs)
- [Vercel 배포 가이드](https://vercel.com/docs)

### 커뮤니티
- [Supabase Discord](https://discord.supabase.com)
- [Stripe Discord](https://discord.gg/stripe)

---

## 🎉 설정 완료!

모든 설정이 완료되었습니다. 이제 Joy-Flower 프로젝트 개발을 시작할 수 있습니다!

**다음 단계**: Phase 2 - 데이터베이스와 API 개발을 진행하세요.
