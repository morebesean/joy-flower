# 🌸 Joy-Flower

A modern e-commerce platform for flower shop operations, built for Guam market with full US payment support.

## ✨ Features

### Customer Features
- 🌷 Browse flower catalog with categories
- 🛒 Shopping cart functionality
- 📝 Order management with delivery/pickup options
- 💳 Secure payment processing (Stripe)
- 📱 Responsive design for all devices
- 💌 Custom message card support

### Admin Features
- 📊 Dashboard with sales analytics
- 🌺 Product management (CRUD operations)
- 🖼️ Image upload to Supabase Storage
- 📦 Order management with status tracking
- 👥 Customer management
- 📈 Inventory/stock management

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **Payment**: Stripe (US/Guam support)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **State Management**: Zustand
- **Form Handling**: React Hook Form + Zod
- **Deployment**: Vercel

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier)
- Stripe account (test mode free)
- Git

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Joy-Flower
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project at [Supabase](https://app.supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon key
4. Go to SQL Editor and run the database schema (see `docs/database-schema.sql`)
5. Create a storage bucket named `product-images` (public)

### 4. Set up Stripe

1. Create account at [Stripe](https://dashboard.stripe.com)
2. Get your test API keys from Developers > API keys
3. Set up webhook endpoint (after deployment) at Developers > Webhooks

### 5. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
joy-flower/
├── app/
│   ├── (customer)/          # Customer-facing pages
│   │   ├── page.tsx         # Home/Product listing
│   │   ├── products/        # Product details
│   │   ├── cart/            # Shopping cart
│   │   ├── checkout/        # Checkout flow
│   │   └── orders/          # Order tracking
│   ├── admin/               # Admin dashboard
│   │   ├── login/           # Admin authentication
│   │   ├── dashboard/       # Analytics dashboard
│   │   ├── products/        # Product management
│   │   ├── orders/          # Order management
│   │   └── stock/           # Inventory management
│   └── api/                 # API routes
│       ├── checkout/        # Stripe checkout
│       ├── webhooks/        # Stripe webhooks
│       └── admin/           # Admin APIs
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── customer/            # Customer components
│   └── admin/               # Admin components
├── lib/
│   ├── supabase/            # Supabase clients
│   ├── stripe/              # Stripe clients
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   └── validators/          # Zod schemas
└── public/
    └── images/              # Static images
```

## 🗄️ Database Schema

The database consists of 4 main tables:

- `products` - Flower catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `stock_history` - Inventory tracking

See the complete schema in the setup documentation.

## 💳 Payment Flow (Stripe)

1. Customer adds items to cart
2. Customer fills order form (shipping, contact info)
3. Click "Proceed to Payment" → redirects to Stripe Checkout
4. Customer enters card information on Stripe's secure page
5. Payment processed → redirects back to success page
6. Webhook updates order status in database

## 🔐 Admin Access

Default admin credentials (change in production):
- Username: `admin`
- Password: `changeme`

Access admin panel at `/admin/login`

## 🌍 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Post-deployment

1. Set up Stripe webhook:
   - URL: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `payment_intent.succeeded`
2. Update `NEXT_PUBLIC_APP_URL` to your production URL

## 📝 Development Roadmap

### Phase 1: Setup ✅
- [x] Project initialization
- [x] Dependencies installation
- [x] Folder structure
- [x] Environment configuration

### Phase 2: Database & API (Next)
- [ ] Create Supabase schema
- [ ] Set up authentication
- [ ] Build product APIs
- [ ] Build order APIs

### Phase 3: Customer Frontend
- [ ] Home page with product grid
- [ ] Product detail pages
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Stripe integration
- [ ] Order confirmation

### Phase 4: Admin Dashboard
- [ ] Admin authentication
- [ ] Product management
- [ ] Order management
- [ ] Dashboard analytics
- [ ] Stock management

### Phase 5: Polish & Deploy
- [ ] Mobile optimization
- [ ] Error handling
- [ ] Performance optimization
- [ ] Production deployment

## 🤝 Contributing

This is a private project for Joy-Flower shop operations.

## 📄 License

Private - All rights reserved

## 🆘 Support

For issues or questions, contact the development team.

---

Built with 💐 for Joy-Flower, Guam
