# Nexus - Quick Setup Guide

This guide will get you up and running with the complete Nexus multi-vendor e-commerce platform in 10 minutes.

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud)
- npm or pnpm package manager

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies (if using Express backend)
cd ../server
npm install
```

### 2. Configure Environment Variables

Create `.env.local` in the **client** directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/nexus"

# Better Auth
BETTER_AUTH_SECRET="ylhEVVQz0CJXzGh"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Providers
GITHUB_CLIENT_ID="Ov23libk"
GITHUB_CLIENT_SECRET="7497a43b08330210c1"
GOOGLE_CLIENT_ID="502662olsdl6gnt.com"
GOOGLE_CLIENT_SECRET="GOCSPX"

# External Services
CLOUDINARY_CLOUD_NAME='iu'
CLOUDINARY_API_KEY='46351'
CLOUDINARY_API_SECRET='your_secret'

STRIPE_SECRET_KEY='sk_...'
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY='pk_...'

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PLATFORM_COMMISSION_PERCENT="10"
```

### 3. Setup Database

```bash
cd server

# Run migrations
npx prisma migrate dev --name init_schema

# Generate Prisma client
npx prisma generate

# View data in studio (optional)
npx prisma studio
```

### 4. Start Development Servers

**Terminal 1 - Frontend:**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

**Terminal 2 - Backend (Optional):**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

## ✨ Key Features Explained

### 1. **Role Request System**
When a customer applies to become a vendor or delivery partner:
1. They fill out a form (shop details for vendors, vehicle info for delivery)
2. Admin reviews in their dashboard
3. Upon approval, a Prisma transaction:
   - Updates user role
   - Creates vendor/delivery profile
   - Notifies the user

### 2. **Order & Delivery Flow**
```
Customer Order → Vendor Accepts → Vendor Assigns Delivery Partner → 
Delivery Partner Completes → Auto-Update Earnings & Finances
```

### 3. **Financial Integrity**
When delivery is completed:
- Delivery partner gets: **80/120 BDT** (shipping)
- Vendor gets: **product price - 10% commission**
- Platform gets: **10% commission**
- Customer record: **total spend += order amount**

### 4. **The 5 Dashboards**
- **Customer**: Browse, order, apply for roles
- **Vendor**: Manage products & assign deliveries
- **Delivery Partner**: Track jobs & earnings
- **Admin**: Approve role requests
- **Super Admin**: Global analytics & user management

## 🎨 UI Components Overview

All components use **Glassmorphism** design:

```typescript
// GlassCard - Base card component
<GlassCard className="p-6">
  <h2>Your Content</h2>
</GlassCard>

// BentoGrid - Responsive grid
<BentoGrid>
  <StatCard title="Sales" value="৳50,000" />
  <StatCard title="Orders" value="125" />
</BentoGrid>

// AnimatedTimeline - Order status
<AnimatedTimeline items={timelineItems} />

// Skeleton - Loading state
<Skeleton count={3} className="h-12 w-full" />
```

## 🔌 API Routes

### Role Request
```bash
POST /api/role-request
{
  "requestType": "VENDOR",
  "data": {
    "shopName": "My Store",
    "businessType": "retail",
    ...
  }
}
```

### Assign Delivery
```bash
POST /api/delivery/assign
{
  "orderId": "order-123",
  "vendorId": "vendor-456",
  "partnerId": "partner-789"
}
```

### Mark Delivered
```bash
POST /api/delivery/mark-delivered
{
  "deliveryId": "delivery-123",
  "rating": 5,
  "feedback": "Great service!"
}
```

## 📊 Database Schema Quick Reference

### Key Models
- **User**: 5 roles, auth info, financial tracking
- **RoleRequest**: Vendor/Delivery applications
- **Vendor**: Shop info, balance, sales
- **DeliveryPartner**: Vehicle info, earnings
- **Order**: Customer orders with shipping
- **Delivery**: Logistics tracking
- **Transaction**: All money movements

## 🔒 Authentication

The system uses **Better Auth** which handles:
- Email/Password registration & login
- Google OAuth
- GitHub OAuth
- Email verification
- Password reset
- 2FA support

## 🎓 Learning Path

### Day 1: Setup & Basics
- [ ] Install dependencies
- [ ] Configure environment
- [ ] Run migrations
- [ ] Start dev servers
- [ ] Explore dashboards

### Day 2: Core Features
- [ ] Test customer → vendor application
- [ ] Test admin approval flow
- [ ] Create test orders
- [ ] Test delivery assignment

### Day 3: Advanced
- [ ] Review financial calculations
- [ ] Test transaction logging
- [ ] Explore Super Admin analytics
- [ ] Customize UI components

## 🐛 Common Issues & Solutions

### Issue: Database connection error
**Solution**: Verify `DATABASE_URL` in `.env.local`
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Issue: Prisma client not found
**Solution**: Regenerate client
```bash
npx prisma generate
```

### Issue: Port already in use
**Solution**: Use different port
```bash
npm run dev -- -p 3001
```

### Issue: OAuth not working
**Solution**: Verify client IDs and secrets in `.env.local`

## 📈 Customization

### Change Platform Commission
Edit `lib/nexus-constants.ts`:
```typescript
export const PLATFORM_COMMISSION = {
  VENDOR: 15, // Changed from 10%
};
```

### Change Shipping Charges
Edit `lib/nexus-constants.ts`:
```typescript
export const SHIPPING_ZONES = {
  DHAKA: { charge: 100 }, // Changed from 80
  OUTSIDE_DHAKA: { charge: 150 }, // Changed from 120
};
```

### Customize Colors
All components use Tailwind classes. Update in component files.

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd client
npm run build
# Connect to Vercel for automatic deploys
```

### Backend (Optional - Railway, Render, Heroku)
```bash
cd server
npm run build
# Deploy with your preferred platform
```

## 📞 Support

For issues or questions:
1. Check `NEXUS_IMPLEMENTATION_GUIDE.md`
2. Review component source code
3. Check Prisma schema for database structure
4. Review API routes for endpoint details

## 🎉 Next Steps

1. **Customize branding**: Update colors, logos, text
2. **Add real payment**: Integrate Stripe
3. **Setup email**: Configure email service
4. **Add notifications**: Integrate Socket.io
5. **Deploy**: Push to production

---

**Ready to scale? Start building! 🚀**
