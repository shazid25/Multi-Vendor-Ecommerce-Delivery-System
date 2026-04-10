# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- PostgreSQL running
- pnpm installed (`npm install -g pnpm`)

## Step 1: Set Up PostgreSQL Database

Make sure PostgreSQL is running and create a database:

```bash
# On Windows (using psql)
psql -U postgres
CREATE DATABASE ecommerce_delivery;
\q

# Or use pgAdmin GUI
```

## Step 2: Configure Environment Variables

### Backend (.env)
```bash
cd server
# Copy the provided .env file or create one:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/ecommerce_delivery"
# JWT_SECRET="your_secret_key"
# PORT=5000
# NODE_ENV="development"
# CLIENT_URL="http://localhost:3000"
```

### Frontend (.env.local)
```bash
cd client
# Copy the provided .env.local file
# NEXT_PUBLIC_API_URL=http://localhost:5000/api
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Step 3: Set Up Backend

```bash
cd server

# Install dependencies
pnpm install

# Run database migrations
pnpm prisma:migrate

# Generate Prisma client
pnpm prisma:generate

# Start development server
pnpm dev
```

The backend will start on: **http://localhost:5000**

## Step 4: Set Up Frontend

In a new terminal:

```bash
cd client

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

The frontend will start on: **http://localhost:3000**

## Step 5: Test the Application

1. Open http://localhost:3000 in your browser
2. Click "Register" to create a new account
3. After registration, you'll be logged in automatically
4. You'll be redirected to your role-based dashboard

## Test Credentials

After running migrations, you can create test users through the registration form.

## Available Test Scenarios

### 1. Customer Registration & Login
- Register as a new customer
- Login with credentials
- Access customer dashboard

### 2. Admin Access (Manual Setup)
```bash
# Use Prisma Studio to create admin user
cd server
pnpm prisma:studio
```

Then create a user with role "admin" or "super_admin"

## Useful Commands

### Backend
```bash
cd server

# Start dev server with auto-reload
pnpm dev

# Build for production
pnpm build

# Start production build
pnpm start

# View database with Prisma Studio
pnpm prisma:studio

# Create new migration
pnpm prisma:migrate dev --name "migration_name"

# Reset database (⚠️ ONLY in development!)
pnpm prisma migrate reset
```

### Frontend
```bash
cd client

# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production build
pnpm start

# Lint code
pnpm lint
```

## Project Structure Quick Reference

```
client/
├── app/
│   ├── (auth)/          # Login, Register, Forgot Password
│   ├── dashboard/       # Role-based dashboards
│   └── page.tsx         # Home page
├── components/          # Reusable components
├── context/            # Auth context
├── hooks/              # Custom hooks
├── lib/                # Utilities & schemas
└── public/             # Static files

server/
├── src/
│   ├── auth/           # JWT, schemas
│   ├── controllers/    # Auth logic
│   ├── middleware/     # Auth, error handling
│   ├── routes/         # API routes
│   ├── utils/          # Helper functions
│   └── index.ts        # Entry point
├── prisma/
│   └── schema.prisma   # Database schema
└── .env                # Environment config
```

## Common Issues & Solutions

### Issue: Database Connection Failed
**Solution:** 
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Issue: Port Already in Use
**Solution for Windows:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual number)
taskkill /PID [PID] /F

# Same for port 3000
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

### Issue: Prisma Client Not Found
**Solution:**
```bash
cd server
pnpm prisma:generate
```

### Issue: API Returns 401 Unauthorized
**Solution:**
- Check if token is being sent in Authorization header
- Verify token hasn't expired
- Try logging in again

## OAuth Setup (Optional)

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable OAuth 2.0
4. Add credentials (OAuth 2.0 Client ID)
5. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env` files

### GitHub OAuth
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create new OAuth App
3. Add Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
4. Copy Client ID and Secret to `.env` files

## Next Steps

1. ✅ Register and login
2. ⏳ Create vendor accounts
3. ⏳ Create delivery accounts
4. ⏳ Test role-based dashboards
5. ⏳ Configure OAuth (Google/GitHub)
6. ⏳ Set up email notifications
7. ⏳ Add product management
8. ⏳ Set up payment processing

## Deployment

### Backend (Node.js hosting like Heroku, Railway, Render)
```bash
cd server
pnpm build
# Set environment variables on hosting platform
# Push to git and deploy
```

### Frontend (Vercel, Netlify)
```bash
cd client
pnpm build
# Connect to Vercel/Netlify
# Push to git and deploy automatically
```

## Support & Documentation

- Next.js: https://nextjs.org/docs
- Express.js: https://expressjs.com/
- Prisma: https://www.prisma.io/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- React Hook Form: https://react-hook-form.com/

---

Happy coding! 🚀
