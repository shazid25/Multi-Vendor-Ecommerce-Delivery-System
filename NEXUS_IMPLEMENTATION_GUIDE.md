# Nexus - Multi-Vendor E-Commerce & Delivery Management System

A production-ready, fully scalable platform for managing vendors, delivery partners, and complex financial workflows. Built with Next.js 15, TypeScript, Prisma, and advanced UI components.

## 🎯 Key Features

### 1. **Dynamic Role Request System**
- Customers can apply to become vendors or delivery partners
- Admin review and approval with transaction-based role updates
- Automatic profile creation upon approval
- Rejection with custom reasons

### 2. **Vendor-First Logistics Engine**
- Vendors control delivery partner assignment
- Location-based shipping charges (Dhaka: 80 BDT, Outside: 120 BDT)
- Real-time available delivery partner list
- Vendor accepts orders and assigns delivery

### 3. **Financial Integrity System**
- **Delivery Partner**: Automatic shipping charge addition to earnings
- **Vendor**: Product price minus platform commission (10%) goes to balance
- **Platform**: Commission tracked for super admin visibility
- **Customer**: Total spend tracked for analytics
- All transactions recorded in audit trail

### 4. **Five-Role System**
- **CUSTOMER**: Browse, purchase, apply to become vendor/delivery
- **VENDOR**: Manage products, accept orders, assign delivery
- **DELIVERY_PARTNER**: View assigned jobs, mark delivered, earn money
- **ADMIN**: Approve role requests, moderate platform
- **SUPER_ADMIN**: God view with user management and global analytics

### 5. **UI/UX Excellence**
- Glassmorphism design throughout
- Bento grid layouts
- Animated timelines
- Framer Motion 3D tilt cards
- Theme toggle with ripple effect
- Skeleton loaders for all async data
- Sonner toast notifications

## 📁 Project Structure

```
nexus/
├── client/                      # Next.js 15 frontend
│   ├── app/
│   │   ├── (auth)/             # Auth pages (login, register, forgot-password)
│   │   ├── dashboard/
│   │   │   ├── customer/       # Customer dashboard with role request forms
│   │   │   ├── vendor/         # Product & order management
│   │   │   ├── delivery/       # Job tracking & earnings
│   │   │   ├── admin/          # Role request approval center
│   │   │   └── super-admin/    # Global analytics & user management
│   │   ├── api/                # API routes
│   │   │   ├── role-request/
│   │   │   └── delivery/
│   │   ├── actions/            # Server actions
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   └── nexus-components.tsx  # Reusable glassmorphism components
│   │   ├── AnimatedThemeToggle.tsx
│   │   └── ...
│   ├── hooks/
│   │   └── use-nexus-actions.ts
│   ├── lib/
│   │   ├── nexus-constants.ts
│   │   └── ...
│   └── package.json
│
├── server/                      # Express.js backend (optional for complex operations)
│   ├── src/
│   │   ├── auth/
│   │   │   └── config.ts       # Better Auth configuration
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── prisma/
│   │   └── schema.prisma       # Complete database schema
│   └── package.json
│
└── .env.local                  # Environment variables
```

## 🗄️ Database Schema Highlights

### Core Models
- **User**: 5 roles (CUSTOMER, VENDOR, DELIVERY_PARTNER, ADMIN, SUPER_ADMIN)
- **RoleRequest**: Vendor/Delivery partner applications
- **Vendor**: Shop details, financial tracking
- **DeliveryPartner**: Vehicle info, earnings, availability
- **Product**: Vendor inventory
- **Order**: Customer purchases with shipping zones
- **Delivery**: Logistics tracking
- **Transaction**: All financial movements

### Key Relationships
- User → Vendor/DeliveryPartner (1:1)
- Vendor → Products (1:Many)
- Order → DeliveryAssignment → Delivery (Chain)
- All earnings automatically tracked via Transaction model

## 🔐 Authentication

Uses **Better Auth** with:
- Email/Password credentials
- Google OAuth
- GitHub OAuth
- Email verification
- Password reset
- Two-factor authentication support

Configure in `.env.local`:
```env
BETTER_AUTH_SECRET="ylhEVVQz0CJXzGh"
GITHUB_CLIENT_ID="Ov23libk"
GITHUB_CLIENT_SECRET="7497a43b..."
GOOGLE_CLIENT_ID="502662..."
GOOGLE_CLIENT_SECRET="GOCSPX..."
```

## 🚀 Server Actions & API Routes

### Server Actions (Type-safe, Client → Server)
- `submitRoleRequest()`: Create vendor/delivery applications
- `approveRoleRequest()`: Admin approval (transaction-based)
- `assignDeliveryPartner()`: Vendor assigns partner
- `markDeliveryAsDelivered()`: Auto-update earnings

### API Routes
- `POST /api/role-request`: Create role request
- `GET /api/role-request?status=PENDING`: Fetch requests
- `POST /api/delivery/assign`: Assign delivery partner
- `POST /api/delivery/mark-delivered`: Mark delivery complete

## 💰 Financial Workflows

### Order Flow
1. Customer places order
   - Shipping charge calculated (80 or 120 BDT)
   - Platform commission (10%) extracted from product price

2. Vendor accepts order
   - Order created with vendor details
   - Vendor sees pending delivery assignment

3. Vendor assigns delivery partner
   - DeliveryAssignment created
   - Delivery record created with status = ASSIGNED

4. Delivery partner marks delivered
   - **Automatically**:
     - Add shipping charge to delivery partner earnings
     - Add (price - commission) to vendor balance
     - Add commission to platform revenue
     - Update customer total spent
     - Create transaction records for audit

## 🎨 UI Components

### Glassmorphism Components
- **GlassCard**: Base component with blur and frosted glass effect
- **BentoGrid**: Responsive grid with staggered animations
- **StatCard**: Dashboard stat with trends and rotating icons
- **AnimatedTimeline**: Order status timeline with smooth animations
- **TiltCard**: 3D tilt effect on hover
- **Skeleton**: Pulse animation loaders
- **LoadingSpinner**: Rotating spinner

### Theme & Animations
- **AnimatedThemeToggle**: Sun/Moon morphing with ripple effect
- Framer Motion for all animations
- Dark mode support via `next-themes`
- Custom CSS for glassmorphism

## 📊 Dashboards

### Customer Dashboard
- Order tracking with animated timeline
- Total spend analytics
- "Become a Vendor" form
- "Become a Delivery Partner" form
- Recent orders list

### Vendor Dashboard
- Shop stats (balance, sales, rating)
- Product management (add, edit, delete)
- Order list with delivery assignment
- Delivery partner selection dropdown
- Sales charts

### Delivery Partner Dashboard
- Active jobs with location & timing
- Mark delivered with rating/feedback
- Completed deliveries list
- Daily/Weekly/Monthly earnings breakdown
- Total earnings and available balance

### Admin Dashboard
- Pending role requests (vendor/delivery)
- Approve/Reject with reason
- Stats dashboard (pending, approved, rejected)
- Filter by request type

### Super Admin Dashboard
- Global user management table
- Edit user roles
- Delete users
- Financial overview charts
- Platform revenue tracking
- Total customer spend analytics

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Step 1: Database Setup
```bash
cd server
npm install
npx prisma migrate dev --name init_schema
npx prisma db seed  # Optional: seed with test data
```

### Step 2: Client Setup
```bash
cd client
npm install
```

### Step 3: Environment Variables
Create `.env.local` in both client and server:
```env
# Database
DATABASE_URL="postgresql://..."

# Auth
BETTER_AUTH_SECRET="ylhEVVQz0CJXzGh"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth
GITHUB_CLIENT_ID="Ov23libk..."
GITHUB_CLIENT_SECRET="7497a43b..."
GOOGLE_CLIENT_ID="502662..."
GOOGLE_CLIENT_SECRET="GOCSPX..."

# External Services
CLOUDINARY_CLOUD_NAME="iu"
CLOUDINARY_API_KEY="46351"
STRIPE_SECRET_KEY="sk_..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PLATFORM_COMMISSION_PERCENT="10"
```

### Step 4: Run Development Servers
```bash
# Terminal 1: Frontend
cd client
npm run dev  # http://localhost:3000

# Terminal 2: Backend (if needed)
cd server
npm run dev  # http://localhost:5000
```

## 📝 Usage Examples

### Create Vendor Application
```typescript
import { submitRoleRequest } from "@/app/actions/nexus-actions";

const result = await submitRoleRequest("VENDOR", {
  shopName: "My Electronics Store",
  shopDescription: "Premium gadgets and accessories",
  businessType: "retail",
  phoneNumber: "+880123456789",
});
```

### Approve Role Request (Admin)
```typescript
import { approveRoleRequest } from "@/app/actions/nexus-actions";

const result = await approveRoleRequest(
  "request-id",
  "admin-user-id"
);
```

### Assign Delivery Partner (Vendor)
```typescript
import { assignDeliveryPartner } from "@/app/actions/nexus-actions";

const result = await assignDeliveryPartner(
  "order-id",
  "vendor-id",
  "delivery-partner-id"
);
```

### Mark Delivery Complete (Delivery Partner)
```typescript
import { markDeliveryAsDelivered } from "@/app/actions/nexus-actions";

const result = await markDeliveryAsDelivered(
  "delivery-id",
  5,  // rating
  "Great delivery!"  // feedback
);
```

## 🔒 Security Best Practices

1. **Server Actions**: All critical operations use server actions for security
2. **Prisma Transactions**: Multi-step operations use transactions for atomicity
3. **Type Safety**: Full TypeScript strict mode
4. **Input Validation**: Zod schemas for all forms
5. **Authentication**: Better Auth with OAuth
6. **Authorization**: Role-based access control in middleware
7. **Audit Trail**: All transactions logged

## 📈 Performance Optimizations

- **Database Indexes**: All foreign keys and status fields indexed
- **Caching**: Revalidation strategies with Next.js cache
- **Lazy Loading**: Dynamic imports for heavy components
- **Image Optimization**: Next Image for all product images
- **API Optimization**: Pagination and filtering implemented

## 🎓 Advanced Features

### Dynamic Location-Based Shipping
```typescript
export function calculateShippingCharge(city: string): number {
  return city.toLowerCase() === "dhaka" ? 80 : 120;
}
```

### Automatic Financial Calculations
```typescript
export function calculateVendorIncome(price: number) {
  const commission = (price * 10) / 100;
  return price - commission;
}
```

### Transaction-Based Role Approval
Ensures atomicity:
1. Update User role
2. Create Vendor/DeliveryPartner profile
3. Send notification
All succeed or all fail together.

## 🐛 Testing

Run tests for critical workflows:
```bash
cd client
npm run test

cd server
npm run test
```

## 📚 Documentation

- **API Documentation**: See `API_DOCUMENTATION.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Deployment**: See deployment guides

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🎉 What's Next?

- [ ] Payment gateway integration (Stripe)
- [ ] Real-time notifications (Socket.io)
- [ ] Advanced analytics dashboard
- [ ] Vendor withdrawal system
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Email service integration
- [ ] SMS notifications

---

**Built with ❤️ for scalable e-commerce**
