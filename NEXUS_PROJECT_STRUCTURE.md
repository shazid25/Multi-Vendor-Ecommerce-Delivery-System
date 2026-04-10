# Nexus - Complete Project Structure

## 📁 Full Directory Tree

```
Multi-Vendor E-Commerce-Delievery/
│
├── 📄 NEXUS_IMPLEMENTATION_GUIDE.md         ← Start here for detailed info
├── 📄 NEXUS_QUICK_START.md                   ← 10-minute setup guide
├── 📄 NEXUS_PROJECT_COMPLETION.md            ← What was built
├── 📄 NEXUS_DEVELOPER_CHEATSHEET.md          ← Quick reference
├── 📄 README.md                              ← Main readme
├── 📄 .env.local                             ← Environment variables
│
├── 📂 client/                                # Next.js 15 Frontend
│   ├── 📄 package.json
│   ├── 📄 pnpm-lock.yaml
│   ├── 📄 tsconfig.json
│   ├── 📄 next.config.js
│   ├── 📄 tailwind.config.js
│   ├── 📄 postcss.config.js
│   ├── 📄 next-env.d.ts
│   │
│   ├── 📂 app/                              # Next.js App Router
│   │   ├── 📄 layout.tsx                    # Root layout with theme
│   │   ├── 📄 page.tsx                      # Home page
│   │   ├── 📄 globals.css                   # Global styles
│   │   │
│   │   ├── 📂 (auth)/                       # Auth pages
│   │   │   ├── login/
│   │   │   │   └── 📄 page.tsx
│   │   │   ├── register/
│   │   │   │   └── 📄 page.tsx
│   │   │   └── forgot-password/
│   │   │       └── 📄 page.tsx
│   │   │
│   │   ├── 📂 actions/                      # Server Actions
│   │   │   └── 📄 nexus-actions.ts          # Core business logic
│   │   │       ├── submitRoleRequest()
│   │   │       ├── approveRoleRequest()
│   │   │       ├── assignDeliveryPartner()
│   │   │       ├── markDeliveryAsDelivered()
│   │   │       ├── calculateShippingCharge()
│   │   │       ├── getAvailableDeliveryPartners()
│   │   │       └── Analytics functions
│   │   │
│   │   ├── 📂 api/                          # API Routes
│   │   │   ├── role-request/
│   │   │   │   └── 📄 route.ts              # POST: create request, GET: fetch
│   │   │   └── delivery/
│   │   │       ├── assign/
│   │   │       │   └── 📄 route.ts          # POST: assign partner
│   │   │       └── mark-delivered/
│   │   │           └── 📄 route.ts          # POST: mark delivered
│   │   │
│   │   ├── 📂 dashboard/                    # Role-based dashboards
│   │   │   ├── 📄 layout.tsx
│   │   │   │
│   │   │   ├── 📂 customer/
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 CustomerDashboard.tsx
│   │   │   │       ├── Order tracking timeline
│   │   │   │       ├── Spending analytics
│   │   │   │       ├── Become vendor form
│   │   │   │       └── Become delivery form
│   │   │   │
│   │   │   ├── 📂 vendor/
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 VendorDashboard.tsx
│   │   │   │       ├── Shop statistics
│   │   │   │       ├── Product management
│   │   │   │       ├── Order list
│   │   │   │       └── Delivery assignment modal
│   │   │   │
│   │   │   ├── 📂 delivery/
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 DeliveryPartnerDashboard.tsx
│   │   │   │       ├── Active jobs
│   │   │   │       ├── Mark as delivered
│   │   │   │       ├── Rating system
│   │   │   │       └── Earnings analytics
│   │   │   │
│   │   │   ├── 📂 admin/
│   │   │   │   ├── 📄 page.tsx
│   │   │   │   └── 📄 AdminDashboard.tsx
│   │   │   │       ├── Pending requests
│   │   │   │       ├── Approve/Reject
│   │   │   │       └── Request filtering
│   │   │   │
│   │   │   └── 📂 super-admin/
│   │   │       ├── 📄 page.tsx
│   │   │       └── 📄 SuperAdminDashboard.tsx
│   │   │           ├── User management table
│   │   │           ├── Global analytics
│   │   │           ├── Financial overview
│   │   │           └── Role editing
│   │   │
│   │   └── 📂 api/
│   │       └── (route files as above)
│   │
│   ├── 📂 components/                       # Reusable React components
│   │   ├── 📂 ui/
│   │   │   └── 📄 nexus-components.tsx      # Custom UI components
│   │   │       ├── GlassCard                # Glassmorphism base
│   │   │       ├── BentoGrid                # Grid layout
│   │   │       ├── StatCard                 # Stats display
│   │   │       ├── AnimatedTimeline         # Order tracking
│   │   │       ├── Skeleton                 # Loaders
│   │   │       ├── TiltCard                 # 3D effect
│   │   │       └── LoadingSpinner           # Spinner
│   │   │
│   │   ├── 📄 AnimatedThemeToggle.tsx       # Dark/light toggle
│   │   ├── 📄 Navbar.tsx
│   │   ├── 📄 Footer.tsx
│   │   ├── 📄 AuthForm.tsx
│   │   └── (other shared components)
│   │
│   ├── 📂 context/                          # React Context
│   │   ├── 📄 theme-context.tsx
│   │   └── 📄 auth-context.tsx
│   │
│   ├── 📂 hooks/                            # Custom React Hooks
│   │   ├── 📄 use-nexus-actions.ts          # Main actions hook
│   │   │   ├── useNexusActions()
│   │   │   └── useAsync()
│   │   └── 📄 use-auth-hooks.ts
│   │
│   └── 📂 lib/                              # Utilities & helpers
│       ├── 📄 nexus-constants.ts            # Constants & utilities
│       │   ├── SHIPPING_ZONES
│       │   ├── PLATFORM_COMMISSION
│       │   ├── Calculation functions
│       │   ├── Formatting functions
│       │   └── Enums
│       ├── 📄 api-client.ts
│       └── 📄 auth-schemas.ts
│
├── 📂 server/                               # Optional Express Backend
│   ├── 📄 package.json
│   ├── 📄 pnpm-lock.yaml
│   ├── 📄 tsconfig.json
│   │
│   ├── 📂 src/
│   │   ├── 📄 index.ts                      # Main server file
│   │   │
│   │   ├── 📂 auth/
│   │   │   ├── 📄 config.ts                 # Better Auth setup
│   │   │   ├── 📄 jwt.ts
│   │   │   └── 📄 schemas.ts
│   │   │
│   │   ├── 📂 controllers/
│   │   │   ├── 📄 authController.ts
│   │   │   └── 📄 uploadController.ts
│   │   │
│   │   ├── 📂 middleware/
│   │   │   ├── 📄 auth.ts
│   │   │   └── 📄 error.ts
│   │   │
│   │   ├── 📂 routes/
│   │   │   ├── 📄 authRoutes.ts
│   │   │   └── 📄 uploadRoutes.ts
│   │   │
│   │   └── 📂 utils/
│   │       └── (utility files)
│   │
│   ├── 📂 prisma/
│   │   ├── 📄 schema.prisma                 # Complete database schema
│   │   │   ├── 🗄️ Models (20+)
│   │   │   │   ├── User (5 roles)
│   │   │   │   ├── RoleRequest
│   │   │   │   ├── Vendor
│   │   │   │   ├── DeliveryPartner
│   │   │   │   ├── Product
│   │   │   │   ├── Order
│   │   │   │   ├── OrderItem
│   │   │   │   ├── VendorOrder
│   │   │   │   ├── Delivery
│   │   │   │   ├── DeliveryAssignment
│   │   │   │   ├── DeliveryEarning
│   │   │   │   ├── Transaction
│   │   │   │   ├── Address
│   │   │   │   ├── PasswordReset
│   │   │   │   └── EmailVerification
│   │   │   │
│   │   │   ├── 📊 Enums (8)
│   │   │   │   ├── UserRole
│   │   │   │   ├── AuthProvider
│   │   │   │   ├── RoleRequestStatus
│   │   │   │   ├── RoleRequestType
│   │   │   │   ├── OrderStatus
│   │   │   │   ├── PaymentStatus
│   │   │   │   ├── DeliveryStatus
│   │   │   │   └── LocationZone
│   │   │   │
│   │   │   └── 🔗 Relations & Indexes
│   │   │
│   │   └── 📂 migrations/
│   │       ├── migration_lock.toml
│   │       └── 📂 20260410042513_init_ecommerce_schema/
│   │           └── 📄 migration.sql
│   │
│   └── 📂 dist/                             # Compiled output
│       └── (compiled files)
│
└── 📄 .env.local                            # Environment variables
    ├── DATABASE_URL
    ├── BETTER_AUTH_SECRET
    ├── OAuth credentials
    ├── External service keys
    └── App config
```

## 📊 Statistics

| Category | Count |
|----------|-------|
| Database Models | 20+ |
| Enums | 8 |
| React Components | 15+ |
| Server Actions | 10+ |
| API Routes | 3 |
| Dashboards | 5 |
| UI Components (Reusable) | 7 |
| Custom Hooks | 2 |
| TypeScript Files | 25+ |
| Total Lines of Code | 3000+ |
| Documentation Pages | 4 |

## 🎯 File Organization Principles

### 1. **Separation of Concerns**
- UI components in `components/`
- Business logic in `actions/`
- Constants in `lib/`
- API routes in `api/`

### 2. **Role-Based Structure**
- Each role has dedicated dashboard
- Shared UI components reusable
- Role-specific utilities isolated

### 3. **Feature Organization**
- Related files grouped together
- Clear naming conventions
- Easy to navigate

### 4. **Type Safety**
- All files TypeScript
- Strict mode enabled
- Zod validation for inputs

## 🚀 Key Entry Points

### For Frontend Development
1. Start: `client/app/layout.tsx`
2. Components: `client/components/ui/nexus-components.tsx`
3. Actions: `client/app/actions/nexus-actions.ts`
4. Dashboards: `client/app/dashboard/*/`

### For Backend Development
1. Schema: `server/prisma/schema.prisma`
2. Auth: `server/src/auth/config.ts`
3. Routes: `server/src/routes/`
4. Migrations: `server/prisma/migrations/`

### For Database
1. Schema: `server/prisma/schema.prisma`
2. Migrations: `npx prisma migrate dev`
3. Studio: `npx prisma studio`
4. Reset: `npx prisma migrate reset`

## 📝 Naming Conventions

### Components
- PascalCase: `CustomerDashboard.tsx`
- Suffix for type: `Input`, `Button`, `Card`
- Example: `StatCard`, `GlassCard`, `LoadingSpinner`

### Functions
- camelCase: `submitRoleRequest()`
- Prefix for type: `get`, `create`, `update`, `delete`, `use`
- Example: `useNexusActions()`, `calculateShippingCharge()`

### Enums
- UPPER_SNAKE_CASE in Prisma
- camelCase access in code
- Example: `UserRole.VENDOR`

### Files
- Dashboard: `[Role]Dashboard.tsx`
- Page: `page.tsx` in each route
- API: `route.ts` in each endpoint

## 🔄 Data Flow Diagram

```
User Input
    ↓
Form Component (with Zod validation)
    ↓
Server Action or API Route
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Response to UI
    ↓
Sonner Toast (success/error)
    ↓
UI Update (with Framer Motion)
```

## 🎨 Component Hierarchy

```
App Root
├── ThemeProvider (next-themes)
├── Layout
│   ├── Navbar
│   ├── AnimatedThemeToggle
│   ├── Main Content
│   │   ├── Dashboard (role-based)
│   │   ├── GlassCard
│   │   ├── BentoGrid
│   │   ├── StatCard
│   │   ├── AnimatedTimeline
│   │   └── Form Components
│   └── Footer
├── Toast Container (Sonner)
└── Modals
```

## 📚 Configuration Files

| File | Purpose |
|------|---------|
| `tsconfig.json` | TypeScript configuration |
| `next.config.js` | Next.js configuration |
| `tailwind.config.js` | Tailwind CSS configuration |
| `postcss.config.js` | PostCSS configuration |
| `.env.local` | Environment variables |
| `prisma/schema.prisma` | Database schema |

---

**This structure is designed for scalability, maintainability, and ease of development.**
