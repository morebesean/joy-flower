# 🚀 Joy Flower 배포 가이드

Vercel을 사용한 Joy Flower 프로덕션 배포 완벽 가이드입니다.

## 📋 배포 전 체크리스트

배포하기 전에 다음 사항들을 확인하세요:

### 1. 환경 설정
- [ ] Supabase 프로젝트 생성 완료
- [ ] Stripe 계정 설정 완료
- [ ] 모든 환경 변수 준비 완료
- [ ] GitHub 리포지토리에 코드 푸시 완료

### 2. 보안
- [ ] 강력한 관리자 비밀번호 설정
- [ ] JWT_SECRET 32자 이상의 랜덤 문자열로 변경
- [ ] .env.local 파일이 .gitignore에 포함되어 있는지 확인

### 3. 데이터베이스
- [ ] Supabase에서 database-schema.sql 실행 완료
- [ ] 샘플 제품 데이터 추가
- [ ] RLS 정책 활성화 확인

---

## 🎯 Step 1: Vercel 계정 생성

1. https://vercel.com 접속
2. GitHub 계정으로 로그인
3. Vercel과 GitHub 연동 승인

---

## 🎯 Step 2: 프로젝트 Import

1. Vercel Dashboard에서 **"Add New..."** → **"Project"** 클릭
2. GitHub 리포지토리 목록에서 **joy-flower** 선택
3. **"Import"** 클릭

---

## 🎯 Step 3: 프로젝트 설정

### Framework 설정
Vercel이 자동으로 감지하지만, 확인하세요:
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### 환경 변수 설정

**"Environment Variables"** 섹션을 펼치고 다음 변수들을 추가:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe (테스트 모드)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=  # 일단 비워두기 (나중에 설정)

# App URL (일단 임시값)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Admin (프로덕션용 강력한 비밀번호!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-strong-password-here
JWT_SECRET=your-random-32-char-secret-here
```

**중요 팁:**
- 각 변수를 입력한 후 **Enter** 키를 눌러 추가하세요
- 환경: **Production**, **Preview**, **Development** 모두 체크

---

## 🎯 Step 4: 배포 시작

1. **"Deploy"** 버튼 클릭
2. 빌드 로그 확인 (약 2-3분 소요)
3. 배포 완료 후 URL 복사 (예: `https://joy-flower-abc123.vercel.app`)

---

## 🎯 Step 5: 배포 후 설정

### 5-1. App URL 업데이트

1. Vercel에서 배포된 **프로덕션 URL** 복사
2. **Settings** → **Environment Variables** 이동
3. `NEXT_PUBLIC_APP_URL` 찾아서 **Edit** 클릭
4. 값을 프로덕션 URL로 변경:
   ```
   https://joy-flower-abc123.vercel.app
   ```
5. **Save** 클릭
6. **Deployments** 탭으로 이동
7. 최신 배포 옆 **...** 메뉴 → **Redeploy** 클릭

### 5-2. Stripe Webhook 설정

#### 테스트 모드 웹훅 (개발용)

1. Stripe Dashboard → **Developers** → **Webhooks** 이동
2. 상단 오른쪽 **Test mode** 토글 확인 (켜져 있어야 함)
3. **"Add endpoint"** 클릭
4. 웹훅 설정:
   ```
   Endpoint URL: https://your-app.vercel.app/api/webhooks/stripe
   Description: Joy Flower Test Webhook
   ```
5. **"Select events"** 클릭
6. 이벤트 선택:
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
7. **"Add endpoint"** 클릭
8. 생성된 엔드포인트 클릭 → **"Signing secret"** 탭
9. `whsec_...` 로 시작하는 키 복사
10. Vercel → **Settings** → **Environment Variables**
11. `STRIPE_WEBHOOK_SECRET` 추가 또는 업데이트
12. **Redeploy**

#### 실제 운영 모드 (프로덕션)

⚠️ **주의**: 실제 결제를 받기 전에 설정하세요!

1. Stripe Dashboard 상단 **Test mode** 토글 **끄기** (Live mode로 전환)
2. **Developers** → **API keys**:
   - Publishable key → `pk_live_...`
   - Secret key → `sk_live_...`
3. Vercel 환경 변수 업데이트:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Live 키로 변경
   - `STRIPE_SECRET_KEY`: Live 키로 변경
4. 웹훅 설정 (위와 동일한 과정, Live mode에서)
5. **Redeploy**

### 5-3. Supabase URL 허용 목록

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. **Site URL** 추가:
   ```
   https://your-app.vercel.app
   ```
3. **Redirect URLs** 추가 (필요시):
   ```
   https://your-app.vercel.app/auth/callback
   ```

---

## 🎯 Step 6: 배포 확인

배포된 사이트에서 다음 사항들을 테스트하세요:

### 고객 기능
- [ ] 홈페이지 로딩 확인
- [ ] 제품 목록 표시
- [ ] 장바구니 추가
- [ ] 체크아웃 페이지 접근
- [ ] 테스트 결제 (`4242 4242 4242 4242`)
- [ ] 주문 성공 페이지 표시
- [ ] 주문 조회 기능

### 관리자 기능
- [ ] `/admin/login` 페이지 접근
- [ ] 관리자 로그인
- [ ] 대시보드 통계 표시
- [ ] 주문 목록 조회
- [ ] 주문 상태 변경
- [ ] 제품 추가/수정
- [ ] 재고 조정

---

## 🔧 문제 해결

### 빌드 실패

**증상**: Vercel 배포 중 빌드 오류 발생

**해결**:
1. Vercel 빌드 로그 확인
2. 로컬에서 `npm run build` 실행하여 오류 재현
3. 오류 수정 후 GitHub에 푸시
4. Vercel이 자동으로 재배포

### 환경 변수 적용 안 됨

**증상**: 설정한 환경 변수가 작동하지 않음

**해결**:
1. Vercel → **Settings** → **Environment Variables** 확인
2. 변수 이름 정확한지 확인 (대소문자 구분)
3. `NEXT_PUBLIC_` 접두사 확인
4. 저장 후 **반드시 Redeploy**

### Stripe 결제 실패

**증상**: 체크아웃 버튼 클릭 시 오류

**해결**:
1. Stripe Dashboard에서 Test mode 확인
2. API 키가 `pk_test_`, `sk_test_`로 시작하는지 확인
3. 브라우저 콘솔에서 오류 메시지 확인
4. Vercel Functions 로그 확인

### 웹훅 이벤트 미수신

**증상**: 결제 후 주문 상태가 업데이트되지 않음

**해결**:
1. Stripe Dashboard → **Developers** → **Webhooks** → **Events**
2. 최근 이벤트 확인 (성공/실패 여부)
3. `STRIPE_WEBHOOK_SECRET` 정확한지 확인
4. Vercel Functions 로그에서 `/api/webhooks/stripe` 확인
5. 엔드포인트 URL이 정확한지 확인

---

## 📊 모니터링

### Vercel Analytics

1. Vercel Dashboard → 프로젝트 선택
2. **Analytics** 탭 클릭
3. 페이지 뷰, 성능 지표 확인

### Vercel Logs

1. **Deployments** 탭
2. 최근 배포 클릭
3. **Functions** 탭에서 API 로그 확인

### Supabase Logs

1. Supabase Dashboard → **Logs** 탭
2. 데이터베이스 쿼리 및 오류 확인

---

## 🔐 보안 체크리스트

배포 후 다음 보안 사항을 확인하세요:

- [ ] `.env.local` 파일이 Git에 커밋되지 않았는지 확인
- [ ] 관리자 비밀번호가 강력한지 확인 (최소 12자, 특수문자 포함)
- [ ] JWT_SECRET이 32자 이상의 랜덤 문자열인지 확인
- [ ] Supabase RLS 정책이 활성화되어 있는지 확인
- [ ] Stripe Secret Key가 노출되지 않았는지 확인
- [ ] `/admin` 경로가 인증 없이 접근되지 않는지 테스트

---

## 🚀 업데이트 배포

코드 수정 후 배포하는 방법:

```bash
# 변경사항 커밋
git add .
git commit -m "Update: 설명"

# GitHub에 푸시
git push origin main

# Vercel이 자동으로 배포 시작!
```

**수동 재배포**가 필요한 경우:
1. Vercel Dashboard → **Deployments**
2. 최근 배포 옆 **...** 메뉴
3. **Redeploy** 클릭

---

## 🎉 배포 완료!

축하합니다! Joy Flower가 성공적으로 배포되었습니다.

**다음 단계:**
- 실제 제품 데이터 추가
- Stripe를 Live mode로 전환 (실제 결제 받을 준비가 되면)
- 커스텀 도메인 연결 (선택사항)
- 이메일 알림 기능 추가 (선택사항)

---

## 📚 추가 리소스

- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Stripe 웹훅 가이드](https://stripe.com/docs/webhooks)
- [Supabase 프로덕션 체크리스트](https://supabase.com/docs/guides/platform/going-into-prod)
