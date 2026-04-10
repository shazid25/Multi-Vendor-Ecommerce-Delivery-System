# Nexus Developer Cheat Sheet

Quick reference for developers working on the Nexus platform.

## 🔗 Key Files Location

| Feature | File | Type |
|---------|------|------|
| Database Schema | `server/prisma/schema.prisma` | Prisma |
| Auth Config | `server/src/auth/config.ts` | TypeScript |
| Server Actions | `client/app/actions/nexus-actions.ts` | TypeScript |
| UI Components | `client/components/ui/nexus-components.tsx` | React |
| Constants | `client/lib/nexus-constants.ts` | TypeScript |
| Hooks | `client/hooks/use-nexus-actions.ts` | TypeScript |
| Theme Toggle | `client/components/AnimatedThemeToggle.tsx` | React |
| Customer Dashboard | `client/app/dashboard/customer/CustomerDashboard.tsx` | React |
| Vendor Dashboard | `client/app/dashboard/vendor/VendorDashboard.tsx` | React |
| Delivery Dashboard | `client/app/dashboard/delivery/DeliveryPartnerDashboard.tsx` | React |
| Admin Dashboard | `client/app/dashboard/admin/AdminDashboard.tsx` | React |
| Super Admin Dashboard | `client/app/dashboard/super-admin/SuperAdminDashboard.tsx` | React |

## 🗄️ Database Quick Commands

```bash
# View database in UI
npx prisma studio

# Create migration
npx prisma migrate dev --name description

# Reset database (dev only!)
npx prisma migrate reset

# Generate Prisma client
npx prisma generate

# Check schema syntax
npx prisma validate
```

## 💾 Key Database Models

### User
```prisma
model User {
  id          String
  email       String @unique
  role        UserRole // CUSTOMER, VENDOR, DELIVERY_PARTNER, ADMIN, SUPER_ADMIN
  totalSpent  Float
  // ... relations to other models
}
```

### Roles
- `CUSTOMER`: Default role, can browse and order
- `VENDOR`: Shop owner, manages products
- `DELIVERY_PARTNER`: Delivery person
- `ADMIN`: Approves role requests
- `SUPER_ADMIN`: Platform administrator

### Order Status Flow
```
PENDING → CONFIRMED → SHIPPED → DELIVERED
                                    ↓
                                  RETURNED
                                    or CANCELLED
```

## 🔄 Common Workflows

### 1. User applies to be vendor
```typescript
// client/app/actions/nexus-actions.ts
await submitRoleRequest("VENDOR", {
  shopName: "My Store",
  businessType: "retail",
  // ...
});
```

### 2. Admin approves vendor
```typescript
// client/app/actions/nexus-actions.ts
await approveRoleRequest(requestId, adminId);
// Automatically:
// - Updates User.role to VENDOR
// - Creates Vendor profile
```

### 3. Vendor assigns delivery
```typescript
// client/app/actions/nexus-actions.ts
await assignDeliveryPartner(orderId, vendorId, partnerId);
// Creates DeliveryAssignment and Delivery records
```

### 4. Delivery partner completes
```typescript
// client/app/actions/nexus-actions.ts
await markDeliveryAsDelivered(deliveryId, rating, feedback);
// Automatically:
// - Add shipping → Partner earnings
// - Add (price - commission) → Vendor balance
// - Add commission → Platform revenue
// - Update customer total spent
// - Create Transaction records
```

## 💰 Financial Constants

```typescript
// lib/nexus-constants.ts

// Shipping Zones
DHAKA = 80 BDT
OUTSIDE_DHAKA = 120 BDT

// Platform Commission
DEFAULT = 10% of product price

// Calculation Example:
// Product: ৳1000
// Commission (10%): ৳100
// Vendor Gets: ৳900
// Delivery (Dhaka): ৳80
// Total to Customer: ৳1080
```

## 🎨 UI Component Usage

### GlassCard
```typescript
<GlassCard className="p-6" delay={0.1} hover={true}>
  <h2>Title</h2>
  <p>Content</p>
</GlassCard>
```

### BentoGrid
```typescript
<BentoGrid>
  <StatCard title="Sales" value="৳50,000" icon={<TrendingUp />} />
  <StatCard title="Orders" value="125" icon={<Package />} />
</BentoGrid>
```

### AnimatedTimeline
```typescript
<AnimatedTimeline items={[
  { status: "Ordered", timestamp: date, description: "Order placed" },
  { status: "Delivered", timestamp: date, description: "Arrived" }
]} />
```

### StatCard
```typescript
<StatCard
  title="Total Earnings"
  value={formatCurrency(50000)}
  icon={<TrendingUp />}
  trend={{ direction: "up", value: 15 }}
/>
```

## 🔌 API Endpoints

### Role Request
```
POST /api/role-request
GET /api/role-request?status=PENDING

Headers: { "x-user-id": "user-id" }
Body: {
  requestType: "VENDOR" | "DELIVERY_PARTNER",
  data: { ... }
}
```

### Delivery Assignment
```
POST /api/delivery/assign

Headers: { "x-user-id": "user-id" }
Body: {
  orderId: "order-id",
  vendorId: "vendor-id",
  partnerId: "partner-id"
}
```

### Mark Delivered
```
POST /api/delivery/mark-delivered

Headers: { "x-user-id": "user-id" }
Body: {
  deliveryId: "delivery-id",
  rating: 5,
  feedback: "Great service!"
}
```

## 📦 NPM Scripts

```bash
# Client
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter

# Server
npm run dev          # Start with tsx watch
npm run build        # TypeScript compilation
npm run start        # Run compiled JS
npm run prisma:*     # Prisma commands
```

## 🎯 Routing Reference

### Dashboard Routes
- Customer: `/dashboard/customer`
- Vendor: `/dashboard/vendor`
- Delivery: `/dashboard/delivery`
- Admin: `/dashboard/admin`
- Super Admin: `/dashboard/super-admin`

### Auth Routes
- Login: `/auth/login`
- Register: `/auth/register`
- Forgot Password: `/auth/forgot-password`

## 🔐 Environment Variables

```env
# Required
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3000

# OAuth
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# External (Optional)
CLOUDINARY_CLOUD_NAME=...
STRIPE_SECRET_KEY=...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
PLATFORM_COMMISSION_PERCENT=10
```

## 🧪 Testing Flows

### Test Role Request Flow
1. Create new user
2. Go to Customer Dashboard
3. Fill "Become a Vendor" form
4. Check `RoleRequest` table in DB
5. Login as Admin
6. Approve/Reject request
7. Check User role changed

### Test Order & Delivery
1. Create Product as Vendor
2. Place Order as Customer
3. Vendor accepts order
4. Vendor assigns delivery partner
5. Delivery partner marks complete
6. Check earnings updated

### Test Financial Calculations
```sql
-- Check vendor income
SELECT balance, totalSales FROM "Vendor" WHERE id = '...';

-- Check delivery earnings
SELECT totalEarnings, availableBalance FROM "DeliveryPartner" WHERE id = '...';

-- Check transactions
SELECT * FROM "Transaction" WHERE type IN ('VENDOR_INCOME', 'DELIVERY_INCOME');
```

## 🐛 Debug Tips

### Check Prisma Logs
```env
DATABASE_URL="postgresql://...?schema=public"
# Add logging
```

### View Generated Types
```typescript
// Hover over any Prisma function in VS Code
// Or check node_modules/.prisma/client/index.d.ts
```

### Test API Routes
```bash
curl -X POST http://localhost:3000/api/role-request \
  -H "Content-Type: application/json" \
  -H "x-user-id: user-123" \
  -d '{"requestType":"VENDOR","data":{...}}'
```

### Check Component Props
```typescript
// All components are fully typed
// Hover over component props in TypeScript
```

## 📊 Data Query Examples

### Get all pending requests
```typescript
const requests = await prisma.roleRequest.findMany({
  where: { status: "PENDING" },
  include: { user: true }
});
```

### Get vendor analytics
```typescript
const vendor = await prisma.vendor.findUnique({
  where: { id: vendorId },
  include: {
    products: true,
    orders: true,
    _count: { select: { products: true } }
  }
});
```

### Get delivery partner earnings
```typescript
const earnings = await prisma.deliveryEarning.findMany({
  where: { deliveryPartnerId },
  include: { deliveryPartner: true }
});

const total = earnings.reduce((sum, e) => sum + e.amount, 0);
```

### Get global analytics
```typescript
const stats = {
  users: await prisma.user.count(),
  vendors: await prisma.vendor.count(),
  revenue: await prisma.transaction.aggregate({
    where: { type: "PLATFORM_COMMISSION" },
    _sum: { amount: true }
  })
};
```

## ⚡ Performance Tips

1. **Use pagination**
   ```typescript
   skip: (page - 1) * limit,
   take: limit
   ```

2. **Select only needed fields**
   ```typescript
   select: { id: true, name: true }
   ```

3. **Include related data efficiently**
   ```typescript
   include: { vendor: { select: { shopName: true } } }
   ```

4. **Use indexes**
   - Already added to schema
   - Check with `@@index` in schema

5. **Cache queries**
   - Use Next.js revalidateTag
   - Use React Query/SWR

## 📋 Common Error Solutions

| Error | Solution |
|-------|----------|
| Database connection error | Check `DATABASE_URL` in `.env.local` |
| Prisma client not found | Run `npx prisma generate` |
| Port already in use | Use `npm run dev -- -p 3001` |
| OAuth not working | Verify credentials in `.env.local` |
| TypeScript errors | Run `npx prisma generate` and `npm run build` |
| Missing relation | Add `include` in Prisma query |

## 🚀 Deployment Checklist

- [ ] Environment variables set
- [ ] Database migrations applied
- [ ] Build succeeds (`npm run build`)
- [ ] No TypeScript errors
- [ ] OAuth credentials configured
- [ ] External services configured
- [ ] Database backed up
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Performance monitoring ready

## 📞 Quick Links

- **Prisma Docs**: https://www.prisma.io/docs/
- **Next.js Docs**: https://nextjs.org/docs
- **Framer Motion**: https://www.framer.com/motion/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Better Auth**: https://www.better-auth.com/

---

**Pro Tip**: Keep this file open while developing! 📖
