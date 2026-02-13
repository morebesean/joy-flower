# 🚀 Joy-Flower Setup Guide

Complete step-by-step guide to set up the Joy-Flower e-commerce platform.

## 📋 Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Stripe Setup](#stripe-setup)
3. [Local Development](#local-development)
4. [Deployment](#deployment)

---

## 1. Supabase Setup

### Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click "New Project"
3. Fill in the details:
   - **Name**: joy-flower (or any name you prefer)
   - **Database Password**: Save this securely
   - **Region**: Choose closest to Guam (e.g., Tokyo or Singapore)
   - **Pricing Plan**: Free
4. Click "Create new project" and wait 2-3 minutes

### Get API Keys

1. Go to **Project Settings** (gear icon) > **API**
2. Copy these values:
   ```
   Project URL → NEXT_PUBLIC_SUPABASE_URL
   anon public → NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```
3. Go to **Project Settings** > **API** > **Project API keys**
4. Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ Keep this secret! Never expose in client-side code

### Create Database Schema

1. Go to **SQL Editor** in the left sidebar
2. Click "New Query"
3. Copy the entire contents of `docs/database-schema.sql`
4. Paste into the editor
5. Click "Run" or press `Cmd/Ctrl + Enter`
6. Verify tables were created:
   - Go to **Table Editor**
   - You should see: `products`, `orders`, `order_items`, `stock_history`

### Create Storage Bucket

1. Go to **Storage** in the left sidebar
2. Click "Create a new bucket"
3. Configure bucket:
   - **Name**: `product-images`
   - **Public bucket**: ✅ Yes (check this)
   - **Allowed MIME types**: `image/*`
   - **File size limit**: 5MB
4. Click "Create bucket"

### Configure Storage Policies (Optional Security)

If you want to restrict uploads to authenticated users only:

1. Go to your `product-images` bucket
2. Click "Policies"
3. Add policy for uploads:
   ```sql
   CREATE POLICY "Authenticated users can upload images"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'product-images');
   ```
4. Add policy for public read:
   ```sql
   CREATE POLICY "Anyone can view images"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'product-images');
   ```

---

## 2. Stripe Setup

### Create Stripe Account

1. Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
2. Sign up with your email
3. Complete the registration process
4. You'll start in **Test mode** (perfect for development)

### Get API Keys

1. In the Stripe Dashboard, go to **Developers** > **API keys**
2. Copy these values:
   ```
   Publishable key → NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   (starts with pk_test_...)

   Secret key → STRIPE_SECRET_KEY
   (starts with sk_test_...)
   ```
3. Click "Reveal test key" for the secret key

### Configure Payment Settings

1. Go to **Settings** > **Payment methods**
2. Enable these payment methods:
   - ✅ Cards (Visa, Mastercard, Amex)
   - ✅ Apple Pay (optional)
   - ✅ Google Pay (optional)

### Test Cards for Development

Use these test card numbers in development:

| Card Number | Brand | Result |
|------------|-------|--------|
| 4242 4242 4242 4242 | Visa | Success |
| 4000 0025 0000 3155 | Visa (3D Secure) | Requires auth |
| 4000 0000 0000 9995 | Visa | Declined |

- **Expiry**: Any future date (e.g., 12/25)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Set Up Webhooks (After Deployment)

⚠️ Do this after deploying to Vercel (see Deployment section)

1. Go to **Developers** > **Webhooks**
2. Click "Add endpoint"
3. Enter your endpoint URL:
   ```
   https://your-domain.vercel.app/api/webhooks/stripe
   ```
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the **Signing secret** → `STRIPE_WEBHOOK_SECRET`
   (starts with `whsec_...`)

For local development, use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## 3. Local Development

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

1. Copy the example file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in all values:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Admin (change these!)
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=your-secure-password
   ```

### Verify Database Connection

Create a test file to verify Supabase connection:

```typescript
// test-db.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function test() {
  const { data, error } = await supabase.from('products').select('*')
  console.log('Products:', data)
  console.log('Error:', error)
}

test()
```

Run: `npx tsx test-db.ts`

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the Next.js welcome page.

---

## 4. Deployment

### Deploy to Vercel

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [https://vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your GitHub repo
   - Click "Import"

3. **Configure Environment Variables**:
   - In the Vercel import screen, expand "Environment Variables"
   - Add all variables from your `.env.local` file
   - **Important**: Update `NEXT_PUBLIC_APP_URL` to your Vercel URL:
     ```
     NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
     ```

4. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Post-Deployment Steps

1. **Update Stripe Webhook**:
   - Go to Stripe Dashboard > Developers > Webhooks
   - Add endpoint: `https://your-app.vercel.app/api/webhooks/stripe`
   - Copy the signing secret to Vercel environment variables:
     - Go to Vercel project > Settings > Environment Variables
     - Update `STRIPE_WEBHOOK_SECRET`
     - Redeploy: Vercel > Deployments > menu > Redeploy

2. **Test Production Payment**:
   - Use Stripe test cards (still in test mode)
   - Verify webhooks are working in Stripe Dashboard > Developers > Webhooks > Events

3. **Enable Stripe Live Mode** (when ready for real payments):
   - Complete Stripe account verification
   - Get production API keys (pk_live_... and sk_live_...)
   - Update Vercel environment variables
   - Update webhook endpoint with production signing secret

### Custom Domain (Optional)

1. In Vercel project, go to **Settings** > **Domains**
2. Add your custom domain (e.g., `joyflower.com`)
3. Follow Vercel's DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` in environment variables

---

## 🔒 Security Checklist

Before going live:

- [ ] Change default admin password
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Rotate all API keys from defaults
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting for API routes
- [ ] Configure Stripe webhook signature verification
- [ ] Set up error monitoring (Sentry)
- [ ] Enable HTTPS only
- [ ] Review Supabase storage permissions

---

## 🆘 Troubleshooting

### "Supabase connection failed"
- Verify `.env.local` has correct values
- Check if Supabase project is running (not paused)
- Ensure RLS policies allow access

### "Stripe checkout not working"
- Verify API keys are correct (test vs. production)
- Check browser console for errors
- Ensure `NEXT_PUBLIC_APP_URL` is correct

### "Images not uploading"
- Verify storage bucket is public
- Check bucket name matches in code (`product-images`)
- Ensure file size is under limit (5MB)

### "Webhook not receiving events"
- Verify webhook URL is correct
- Check Stripe Dashboard > Webhooks > Events
- Ensure `STRIPE_WEBHOOK_SECRET` matches endpoint

---

## 📞 Support

For issues, check:
1. [Supabase Documentation](https://supabase.com/docs)
2. [Stripe Documentation](https://stripe.com/docs)
3. [Next.js Documentation](https://nextjs.org/docs)

---

**Setup Complete!** 🎉 Ready to start building the flower shop.
