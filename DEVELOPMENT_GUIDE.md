# Development Guide

## Local Development Setup

This guide will help you set up the Multi-Vendor E-Commerce Delivery Platform on your local machine.

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** v18 or higher
  - Download from: https://nodejs.org/
  - Verify: `node --version`

- **npm** (comes with Node.js)
  - Verify: `npm --version`

- **pnpm** (package manager)
  ```bash
  npm install -g pnpm
  # Verify
  pnpm --version
  ```

- **PostgreSQL** v12 or higher
  - Download from: https://www.postgresql.org/download/
  - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -d postgres`
  - Verify: `psql --version`

- **Git** (optional, for version control)
  - Download from: https://git-scm.com/

- **VS Code** (recommended editor)
  - Download from: https://code.visualstudio.com/

## Step-by-Step Setup

### 1. Create Database

Open PostgreSQL terminal or GUI and run:

```sql
CREATE DATABASE ecommerce_delivery;
```

Or using command line:
```bash
createdb ecommerce_delivery
```

### 2. Clone/Setup Project

```bash
# Navigate to project directory
cd "Multi-Vendor E-Commerce-Delievery"

# Initialize git (optional)
git init
```

### 3. Backend Setup

```bash
cd server

# Install dependencies
pnpm install

# Create .env file from template
cp .env.example .env

# Edit .env with your PostgreSQL connection
# DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_delivery"
# JWT_SECRET="your_secret_key_here"
# PORT=5000
# NODE_ENV="development"
# CLIENT_URL="http://localhost:3000"

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate dev

# Start development server
pnpm dev
```

The backend will be running on: http://localhost:5000

### 4. Frontend Setup

In a new terminal:

```bash
cd client

# Install dependencies
pnpm install

# Create .env.local file from template
cp .env.example .env.local

# Environment variables should be:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_APP_URL=http://localhost:3000

# Start development server
pnpm dev
```

The frontend will be running on: http://localhost:3000

## Testing the Setup

1. Open http://localhost:3000 in your browser
2. You should see the home page
3. Click "Register" and create a new account
4. After registration, you'll be logged in
5. You'll see your role-based dashboard

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_delivery"

# JWT
JWT_SECRET="your_super_secret_jwt_key_change_this"

# Server
PORT=5000
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Email (optional)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=""
NEXT_PUBLIC_GITHUB_CLIENT_ID=""
```

## Common Commands

### Backend

```bash
cd server

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run Prisma Studio (database GUI)
pnpm prisma:studio

# Create a new migration
pnpm prisma:migrate dev --name "add_new_field"

# Reset database (ONLY in development!)
pnpm prisma migrate reset

# Generate Prisma client
pnpm prisma:generate

# View Prisma docs
pnpm prisma --help
```

### Frontend

```bash
cd client

# Start development server with hot reload
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run linter
pnpm lint

# Fix linting issues
pnpm lint --fix
```

## Project Structure Deep Dive

### Backend Structure

```
server/src/
├── auth/
│   ├── jwt.ts                    # JWT token generation & verification
│   └── schemas.ts               # Zod validation schemas
│
├── controllers/
│   └── authController.ts         # Request handlers for auth routes
│
├── middleware/
│   ├── auth.ts                   # JWT verification middleware
│   └── error.ts                  # Global error handler
│
├── routes/
│   └── authRoutes.ts             # Route definitions
│
├── utils/                        # Utility functions
│
└── index.ts                      # Express app setup & server start
```

### Frontend Structure

```
client/app/
├── (auth)/                       # Auth routes grouped
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── forgot-password/
│       └── page.tsx
│
├── dashboard/                    # Dashboard routes
│   ├── layout.tsx               # Dashboard layout (nav, sidebar)
│   ├── page.tsx                 # Default dashboard
│   ├── customer/
│   │   └── page.tsx
│   ├── vendor/
│   │   └── page.tsx
│   ├── delivery/
│   │   └── page.tsx
│   └── admin/
│       └── page.tsx
│
├── page.tsx                      # Home page
├── layout.tsx                    # Root layout (AuthProvider)
└── globals.css                   # Global styles
```

## Code Examples

### Creating a New API Endpoint

1. **Create Controller** (`src/controllers/exampleController.ts`):
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';

export const exampleHandler = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Your logic here
    res.status(200).json({ message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
};
```

2. **Add Route** (`src/routes/exampleRoutes.ts`):
```typescript
import { Router } from 'express';
import { exampleHandler } from '../controllers/exampleController.js';
import { authMiddleware } from '../middleware/auth.js';

const router: any = Router();

router.post('/example', authMiddleware, exampleHandler);

export default router;
```

3. **Register Route** (`src/index.ts`):
```typescript
import exampleRoutes from './routes/exampleRoutes.js';

app.use('/api/example', exampleRoutes);
```

### Creating a New Frontend Page

1. Create file: `app/newpage/page.tsx`
```typescript
'use client';

import { useAuth } from '@/context/auth-context';

export default function NewPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
    </div>
  );
}
```

2. Access at: `http://localhost:3000/newpage`

## Debugging

### Backend Debugging

1. **Check logs in terminal** where `pnpm dev` is running
2. **Use Prisma Studio** to inspect database:
   ```bash
   pnpm prisma:studio
   ```
3. **Add console.log** for debugging
4. **Check .env** file for correct values

### Frontend Debugging

1. **Open browser DevTools** (F12)
2. **Check Console** for errors
3. **Use React DevTools** extension
4. **Check Network tab** for API calls
5. **Check localStorage** for token and user data

### Database Debugging

```bash
# Open Prisma Studio
pnpm prisma:studio

# Query directly using psql
psql ecommerce_delivery

# List users
SELECT * FROM "User";

# View all tables
\dt
```

## Common Issues & Solutions

### Issue: `pnpm: command not found`
**Solution:**
```bash
npm install -g pnpm
```

### Issue: `PostgreSQL connection refused`
**Solution:**
- Ensure PostgreSQL is running
- Check DATABASE_URL in .env
- Verify credentials

**Windows:** Start PostgreSQL from Services
**Mac:** `brew services start postgresql`
**Linux:** `sudo service postgresql start`

### Issue: `Prisma Client not found`
**Solution:**
```bash
cd server
pnpm prisma:generate
```

### Issue: Port 3000 or 5000 already in use
**Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID [PID] /F
```

**Mac/Linux:**
```bash
# Find process
lsof -i :5000

# Kill process
kill -9 [PID]
```

### Issue: CORS error when calling API
**Solution:**
- Check CLIENT_URL in backend .env
- Verify frontend is calling correct API_URL
- Check CORS middleware in server/src/index.ts

### Issue: Token not working
**Solution:**
- Ensure token is in localStorage
- Check token expiration
- Try logging in again
- Clear localStorage: `localStorage.clear()`

## Best Practices

### Code Style
- Use TypeScript strict mode
- Follow naming conventions
- Add comments for complex logic
- Use descriptive variable names

### Security
- Never commit .env files
- Always validate input
- Hash passwords before storing
- Use HTTPS in production
- Keep dependencies updated

### Performance
- Use lazy loading for components
- Optimize database queries
- Cache frequently accessed data
- Use proper indexes

### Testing
- Test API endpoints with Postman
- Test different user roles
- Test error scenarios
- Test form validation

## IDE Setup

### VS Code Extensions

Recommended extensions for development:

1. **ES7+ React/Redux/React-Native snippets**
   - ID: dsznajder.es7-react-js-snippets

2. **Prisma**
   - ID: Prisma.prisma

3. **Thunder Client** or **REST Client**
   - For API testing

4. **GitLens**
   - ID: eamodio.gitlens

5. **Prettier - Code Formatter**
   - ID: esbenp.prettier-vscode

6. **ESLint**
   - ID: dbaeumer.vscode-eslint

### VS Code Settings

Create `.vscode/settings.json`:
```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

## Performance Optimization

### Frontend
- Enable Next.js image optimization
- Use dynamic imports for large components
- Implement code splitting
- Optimize bundle size

### Backend
- Add database indexes
- Implement caching strategy
- Use connection pooling
- Optimize queries

### Database
- Add indexes on frequently queried fields
- Regular backups
- Monitor query performance
- Optimize schema design

## Next Steps

1. ✅ Complete local setup
2. ⏳ Familiarize with codebase
3. ⏳ Test authentication flow
4. ⏳ Implement email service
5. ⏳ Set up OAuth
6. ⏳ Start building features

## Getting Help

1. Check documentation files (README.md, etc.)
2. Review code comments
3. Check API documentation
4. Search error messages online
5. Ask in development team/community

## Version Control

```bash
# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Multi-vendor e-commerce platform"

# Add remote repository (if using GitHub/GitLab)
git remote add origin https://your-repo-url.git

# Push to remote
git push -u origin main
```

## Deployment Preparation

Before deploying to production:

1. [ ] Set strong JWT_SECRET
2. [ ] Configure email service
3. [ ] Set up OAuth credentials
4. [ ] Enable HTTPS
5. [ ] Set up database backups
6. [ ] Configure monitoring
7. [ ] Run security audit
8. [ ] Load testing
9. [ ] Update environment variables
10. [ ] Create deployment guide

---

**Happy Developing!** 🚀

For more information, refer to the other documentation files in the project root.
