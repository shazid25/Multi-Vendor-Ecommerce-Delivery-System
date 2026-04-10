# Architecture & Technical Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                 ┌────────▼─────────┐
                 │    Next.js 15    │
                 │   (React + TS)   │
                 │   Port: 3000     │
                 └────────┬─────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   ┌────▼──────┐  ┌──────▼─────┐  ┌────────▼────┐
   │  Auth UI  │  │ Dashboards │  │   Components│
   └───────────┘  └────────────┘  └─────────────┘
        │
        │ HTTP/REST
        │ (Fetch/Axios)
        │
        ├──────────────────────────────────────┐
        │                                      │
┌───────▼─────────────────────────────────────▼────────┐
│                 Express.js Server                     │
│                (Node.js + TypeScript)                 │
│                    Port: 5000                         │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         Routes & Controllers                   │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │  POST /api/auth/register                │  │ │
│  │  │  POST /api/auth/login                   │  │ │
│  │  │  GET  /api/auth/me                      │  │ │
│  │  │  POST /api/auth/logout                  │  │ │
│  │  │  PUT  /api/auth/profile                 │  │ │
│  │  │  POST /api/auth/forgot-password         │  │ │
│  │  │  POST /api/auth/reset-password          │  │ │
│  │  │  POST /api/auth/verify-email            │  │ │
│  │  │  POST /api/auth/oauth-login             │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         Middleware                              │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │  Auth Middleware (JWT verification)    │  │ │
│  │  │  Error Handler (Exception handling)    │  │ │
│  │  │  CORS Middleware                       │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │         Auth Logic                              │ │
│  │  ┌─────────────────────────────────────────┐  │ │
│  │  │  JWT Token Generation/Verification     │  │ │
│  │  │  Password Hashing (bcryptjs)           │  │ │
│  │  │  Password Comparison                   │  │ │
│  │  │  Schema Validation (Zod)               │  │ │
│  │  └─────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────────────┬──────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Prisma ORM  │
                    │  (Database  │
                    │  Abstraction)
                    └──────┬──────┘
                           │
                    ┌──────▼──────────┐
                    │  PostgreSQL DB  │
                    │   Port: 5432    │
                    └─────────────────┘
```

## Technology Stack

### Frontend
| Technology | Purpose | Version |
|-----------|---------|---------|
| Next.js | React framework with SSR/SSG | 15.x |
| React | UI library | 19.x |
| TypeScript | Type safety | 5.x |
| Tailwind CSS | Utility CSS framework | 3.x |
| React Hook Form | Form state management | 7.x |
| Zod | Schema validation | 3.x |
| React Hot Toast | Notifications | 2.x |

### Backend
| Technology | Purpose | Version |
|-----------|---------|---------|
| Node.js | JavaScript runtime | 18+ |
| Express.js | Web framework | 4.x |
| TypeScript | Type safety | 5.x |
| Prisma | ORM | 5.x |
| PostgreSQL | Database | 12+ |
| bcryptjs | Password hashing | 2.x |
| jsonwebtoken | JWT handling | 9.x |
| Zod | Schema validation | 3.x |
| CORS | Cross-origin support | 2.x |
| dotenv | Environment management | 16.x |

## Frontend Architecture

### Folder Structure
```
client/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── forgot-password/
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── customer/
│   │   │   └── page.tsx
│   │   ├── vendor/
│   │   │   └── page.tsx
│   │   ├── delivery/
│   │   │   └── page.tsx
│   │   └── admin/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── (reusable components)
├── context/
│   └── auth-context.tsx
├── hooks/
│   └── use-auth-hooks.ts
├── lib/
│   ├── auth-schemas.ts
│   └── api-client.ts
├── public/
├── .env.local
├── .gitignore
├── next.config.js
├── postcss.config.js
├── tailwind.config.js
└── tsconfig.json
```

### Data Flow

1. **User Interaction** → React Component
2. **Form Submission** → React Hook Form + Zod Validation
3. **API Call** → apiClient (custom wrapper around fetch)
4. **Response** → Auth Context Update
5. **State Change** → Component Re-render
6. **Route Change** → Next.js Router

### Auth Context Flow
```
User Component
    ↓
useAuth Hook
    ↓
AuthContext
    ↓
Login/Register Function
    ↓
apiClient.post()
    ↓
Store Token & User in localStorage
    ↓
Update Auth Context State
    ↓
Component Updates
    ↓
Redirect to Dashboard
```

## Backend Architecture

### Folder Structure
```
server/
├── src/
│   ├── auth/
│   │   ├── jwt.ts (Token generation/verification)
│   │   └── schemas.ts (Zod validation schemas)
│   ├── controllers/
│   │   └── authController.ts (Request handlers)
│   ├── middleware/
│   │   ├── auth.ts (JWT verification)
│   │   └── error.ts (Error handling)
│   ├── routes/
│   │   └── authRoutes.ts (Route definitions)
│   ├── utils/
│   │   └── (utility functions)
│   └── index.ts (Express app setup)
├── prisma/
│   └── schema.prisma (Database schema)
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

### Request Handling Flow
```
Request
    ↓
CORS Middleware
    ↓
Body Parser
    ↓
Route Match
    ↓
Auth Middleware (if protected)
    ↓
Controller Function
    ↓
Validation (Zod)
    ↓
Database Query (Prisma)
    ↓
Response
    ↓
Error Handler (if error)
```

## Database Schema

### Core Models

#### User
```prisma
- id (String, primary key)
- email (String, unique)
- name (String)
- password (String, nullable - for OAuth)
- image (String, nullable)
- role (Enum: customer, vendor, delivery, admin, super_admin)
- provider (Enum: email, google, github)
- emailVerified (DateTime, nullable)
- lastLogin (DateTime, nullable)
- isActive (Boolean)
- Relations: vendor, deliveryPerson, orders, addresses
```

#### Vendor
```prisma
- id (String, primary key)
- userId (String, foreign key, unique)
- shopName (String)
- shopDescription (String, nullable)
- shopImage (String, nullable)
- shopBanner (String, nullable)
- phoneNumber (String)
- businessType (String)
- bankAccountName (String, nullable)
- bankAccountNumber (String, nullable)
- bankName (String, nullable)
- isVerified (Boolean)
- isActive (Boolean)
- Relations: user, products, orders
```

#### DeliveryPerson
```prisma
- id (String, primary key)
- userId (String, foreign key, unique)
- phoneNumber (String)
- vehicleType (String)
- licenseNumber (String)
- licenseExpiry (DateTime)
- isVerified (Boolean)
- isActive (Boolean)
- rating (Float)
- totalDeliveries (Int)
- Relations: user, deliveries
```

#### Product
```prisma
- id (String, primary key)
- vendorId (String, foreign key)
- name (String)
- description (String)
- price (Float)
- discountPrice (Float, nullable)
- image (String, nullable)
- images (String[])
- category (String)
- stock (Int)
- isActive (Boolean)
- Relations: vendor, orderItems
```

#### Order
```prisma
- id (String, primary key)
- userId (String, foreign key)
- orderNumber (String, unique)
- totalAmount (Float)
- shippingAddress (String)
- status (String: pending, confirmed, shipped, delivered, cancelled)
- paymentStatus (String: pending, completed, failed)
- Relations: user, items, delivery, vendorOrders
```

#### OrderItem
```prisma
- id (String, primary key)
- orderId (String, foreign key)
- productId (String, foreign key)
- quantity (Int)
- price (Float)
- subtotal (Float)
- Relations: order, product
```

#### Other Models
- **VendorOrder** - Tracks orders for each vendor
- **Delivery** - Delivery tracking
- **Address** - Customer addresses
- **PasswordReset** - Password reset tokens
- **EmailVerification** - Email verification tokens

## Security Architecture

### Password Security
1. User enters password on frontend
2. Password sent via HTTPS to backend
3. Password hashed with bcryptjs (salt rounds: 10)
4. Hashed password stored in database
5. Original password never stored

### Authentication Flow
1. User login/register
2. Credentials validated
3. JWT token generated with user info
4. Token sent to frontend
5. Frontend stores token in localStorage
6. Token sent in Authorization header for protected endpoints
7. Backend verifies JWT signature and expiration
8. User granted/denied access

### JWT Payload
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "customer",
  "provider": "email",
  "iat": 1712755800,
  "exp": 1713360600
}
```

### CORS Protection
- Only requests from `http://localhost:3000` accepted
- Credentials allowed
- Specific methods allowed: GET, POST, PUT, DELETE, PATCH
- Specific headers allowed: Content-Type, Authorization

### Input Validation
- Zod schemas validate all inputs
- Email format validation
- Password strength requirements
- Type checking
- Length constraints

## Error Handling

### Frontend
```
API Call
    ↓
Response Check
    ↓
Error? → Show Toast → Catch Block
    ↓
Success? → Update State → Success Action
```

### Backend
```
Request
    ↓
Try Block
    ↓
Error? → AppError Instance → Catch Block
    ↓
Error Handler Middleware
    ↓
Send Error Response
```

## Performance Considerations

### Frontend Optimization
- Code splitting (Next.js automatic)
- Image optimization
- Lazy loading components
- Tailwind CSS purging
- CSS-in-JS minification

### Backend Optimization
- Database connection pooling (Prisma)
- Query optimization with indexes
- Middleware ordering for early rejection
- Error responses without stack traces in production
- GZIP compression

### Database Optimization
- Indexes on commonly queried fields
- Relationships properly defined
- Enum types for fixed values
- Pagination ready (use LIMIT/OFFSET)

## Deployment Ready Features

✅ Environment variable management
✅ Error handling
✅ CORS configuration
✅ Security headers ready
✅ Input validation
✅ Password hashing
✅ JWT authentication
✅ Database abstraction (Prisma)
✅ TypeScript strict mode
✅ Build scripts ready

## Future Enhancements

### Performance
- Add caching (Redis)
- Implement pagination
- Add database query optimization
- Implement CDN for assets

### Security
- Add rate limiting
- Implement CSRF protection
- Add request signing
- Implement API key management
- Add audit logging

### Features
- Add email service integration
- Add OAuth full implementation
- Add real-time notifications (WebSocket)
- Add file upload service
- Add payment gateway integration

---

**Architecture Version:** 1.0.0
**Last Updated:** April 10, 2026
