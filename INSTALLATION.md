# LGU Citizen Report Portal - Installation & Deployment Guide

## 🚀 Overview

This guide will walk you through setting up and deploying the LGU Citizen Report Portal using:
- **GitHub** - Code repository and version control
- **Render.com** - Application hosting and deployment
- **Supabase** - Database and authentication services

## 📋 Prerequisites

### Required Accounts
- [GitHub Account](https://github.com/signup)
- [Render Account](https://render.com/register)
- [Supabase Account](https://supabase.com/signup)

### Required Tools
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

## 🛠️ Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/lgu-citizen-report-portal.git
cd lgu-citizen-report-portal
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[YOUR-SECRET-KEY]"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Optional: ZAI SDK (for AI features)
ZAI_API_KEY="[YOUR-ZAI-API-KEY]"
```

### 4. Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Push database schema to Supabase
npx prisma db push

# Seed initial data (optional)
npx prisma db seed
```

### 5. Run Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

---

## 🌐 Supabase Database Setup

### 1. Create New Project
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Project Name**: `lgu-citizen-report-portal`
   - **Database Password**: Create a strong password
   - **Region**: Choose nearest region
5. Click "Create new project"

### 2. Get Database Credentials
1. In your project dashboard, go to **Settings** → **Database**
2. Copy the **Connection string** for your database
3. Replace `[YOUR-PASSWORD]` with your database password

### 3. Get API Keys
1. Go to **Settings** → **API**
2. Copy the following keys:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY)

### 4. Database Schema
The application will automatically create the database schema when you run:
```bash
npx prisma db push
```

This will create the following tables:
- `users` - User accounts and profiles
- `reports` - Citizen reports
- `categories` - Report categories
- `comments` - Report comments
- `notifications` - User notifications

---

## 🚀 GitHub Repository Setup

### 1. Initialize Git Repository
```bash
git init
git add .
git commit -m "Initial commit: LGU Citizen Report Portal"
```

### 2. Create GitHub Repository
1. Go to [GitHub](https://github.com) and click "New repository"
2. Enter repository name: `lgu-citizen-report-portal`
3. Choose visibility (Public or Private)
4. Don't initialize with README (we already have code)
5. Click "Create repository"

### 3. Push to GitHub
```bash
git remote add origin https://github.com/your-username/lgu-citizen-report-portal.git
git branch -M main
git push -u origin main
```

### 4. Create .gitignore
Create a `.gitignore` file in the root directory:

```gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/
.next/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Database
*.db
*.sqlite
*.sqlite3

# Prisma
prisma/migrations/
```

---

## 🎯 Render.com Deployment

### 1. Connect GitHub to Render
1. Log in to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub account
4. Select the `lgu-citizen-report-portal` repository

### 2. Configure Web Service
Fill in the following details:

#### Basic Settings
- **Name**: `lgu-citizen-report-portal`
- **Region**: Choose nearest region
- **Branch**: `main`
- **Root Directory**: Leave empty (root)
- **Runtime**: `Node`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

#### Advanced Settings
- **Instance Type**: `Free` (or `Standard` for better performance)
- **Auto-Deploy**: ✅ Enabled
- **Health Check Path**: `/api/health`

### 3. Environment Variables
Add the following environment variables in Render:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
NEXTAUTH_URL="https://lgu-citizen-report-portal.onrender.com"
NEXTAUTH_SECRET="[YOUR-SECRET-KEY]"
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR-PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"
ZAI_API_KEY="[YOUR-ZAI-API-KEY]"
```

### 4. Deploy
1. Click "Create Web Service"
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be available at `https://lgu-citizen-report-portal.onrender.com`

---

## 🔧 Production Configuration

### 1. Update NextAuth Configuration
In `src/lib/auth.ts`, ensure the callback URLs are configured for production:

```typescript
export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
  },
  session: {
    strategy: 'jwt',
  },
};
```

### 2. Database Migration
The database schema will be automatically applied when the application starts. However, for production, you might want to run migrations manually:

```bash
npx prisma migrate deploy
```

### 3. Health Check Endpoint
Create a health check endpoint at `src/app/api/health/route.ts`:

```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check database connection
    await db.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'unhealthy',
      error: 'Database connection failed'
    }, { status: 500 });
  }
}
```

---

## 📊 Monitoring & Maintenance

### 1. Render Dashboard
- Monitor your app's performance in the Render Dashboard
- Check logs for any errors
- Set up alerts for downtime

### 2. Supabase Dashboard
- Monitor database performance
- Check authentication logs
- Manage user roles and permissions

### 3. GitHub Actions (Optional)
Create `.github/workflows/deploy.yml` for automated testing:

```yaml
name: Test and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Build
      run: npm run build
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Errors
- Verify your DATABASE_URL is correct
- Check if Supabase project is active
- Ensure IP whitelisting is disabled in Supabase

#### 2. Build Failures
- Check build logs in Render
- Ensure all environment variables are set
- Verify Node.js version compatibility

#### 3. Authentication Issues
- Verify NEXTAUTH_URL matches your deployed URL
- Check NEXTAUTH_SECRET is set
- Ensure OAuth providers are configured correctly

#### 4. Performance Issues
- Upgrade to Standard instance on Render
- Optimize database queries
- Enable caching where appropriate

### Debug Commands
```bash
# Check database connection
npx prisma db pull

# Regenerate Prisma client
npx prisma generate

# Check environment variables
npm run build
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Render Documentation](https://render.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)

---

## 🤝 Support

If you encounter any issues during deployment:

1. Check the troubleshooting section above
2. Review the logs in Render and Supabase
3. Create an issue in the GitHub repository
4. Contact the development team

---

## 🎉 Success!

Once you've completed these steps, your LGU Citizen Report Portal will be:
- ✅ Hosted on Render.com
- ✅ Using Supabase for database
- ✅ Connected to GitHub for version control
- ✅ Accessible via a public URL
- ✅ Ready for citizen reports!

**Your portal is now live and ready to serve your community!** 🚀