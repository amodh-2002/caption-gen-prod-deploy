g# Local Testing Guide

This guide will help you test the entire application locally to ensure everything works before deploying to Kubernetes.

## Prerequisites

Before testing, ensure you have:
- ✅ Docker and Docker Compose installed
- ✅ Make installed (optional, but recommended)
- ✅ Google API Key for caption generation (optional for full testing)
- ✅ Git repository cloned

## Step-by-Step Testing

### Step 1: Initial Setup

```bash
# Navigate to project root
cd caption-gen-prod-deploy

# Run initial setup (creates .env files)
make setup
```

This will:
- Copy `services/auth/env.example` to `services/auth/.env`
- Prepare environment files

### Step 2: Configure Environment Variables

Edit `services/auth/.env` if needed (defaults should work for local testing):

```bash
# Default values are fine for local testing:
DB_HOST=postgres
DB_PORT=5432
DB_NAME=caption_gen
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=dev-secret-key-change-in-production-abc123xyz
JWT_EXPIRATION_HOURS=24
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Important**: If you want to test caption generation, you need to set `GOOGLE_API_KEY`:

```bash
# Create .env file in backend directory (if not exists)
echo "GOOGLE_API_KEY=your-google-api-key-here" > backend/.env
```

### Step 3: Start All Services

#### Option A: Using Make (Recommended)
```bash
# Start in development mode (with hot reload)
make dev
```

#### Option B: Using Docker Compose Directly
```bash
# Start all services
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This will start:
- ✅ PostgreSQL database (port 5432)
- ✅ Auth service (port 4000)
- ✅ Backend service (port 5000)
- ✅ Frontend service (port 3000)
- ✅ pgAdmin (port 5050) - for database management

**Wait for all services to be healthy** (check logs if needed).

### Step 4: Verify Services Are Running

#### Check Service Status
```bash
# Using Make
make status

# Or using Docker Compose
docker-compose ps
```

All services should show as "Up" or "running".

#### Test Health Endpoints
```bash
# Test all services
make test-all

# Or test individually
make test-auth      # Tests auth service
make test-backend   # Tests backend service
```

Expected output:
- ✅ Auth service: `{"status":"healthy","service":"auth"}`
- ✅ Backend service: `{"status":"healthy"}`

### Step 5: Test Database

```bash
# Open database shell
make db-shell

# Inside psql, run:
SELECT * FROM plans;
SELECT * FROM users;
\q  # Exit
```

You should see:
- ✅ 4 plans (Free, Basic, Pro, Enterprise)
- ✅ Empty users table (initially)

### Step 6: Test Frontend

1. **Open browser**: http://localhost:3000

2. **Test User Registration**:
   - Click "Try Free" or navigate to `/signup`
   - Fill in:
     - Name: Test User
     - Email: test@example.com
     - Password: testpassword123
   - Click "Sign Up"
   - ✅ Should redirect to login page with success message

3. **Test User Login**:
   - Navigate to `/login`
   - Enter credentials from signup
   - Click "Login"
   - ✅ Should redirect to home page
   - ✅ Navbar should show your name/email

4. **Test Account Settings**:
   - Click your name in navbar → "Account"
   - ✅ Should show:
     - Your name and email
     - Current plan (should be "Free")
     - Caption usage (0/10 for Free plan)

### Step 7: Test Auth Service API

#### Using Browser/Postman
1. **Test Signup**:
   ```bash
   curl -X POST http://localhost:4000/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "api-test@example.com",
       "password": "testpass123",
       "full_name": "API Test User"
     }'
   ```
   ✅ Should return JWT token and user info

2. **Test Login**:
   ```bash
   curl -X POST http://localhost:4000/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "api-test@example.com",
       "password": "testpass123"
     }'
   ```
   ✅ Should return JWT token

3. **Test Get Current User** (replace TOKEN with actual token):
   ```bash
   curl -X GET http://localhost:4000/me \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```
   ✅ Should return user information

4. **Test Subscription**:
   ```bash
   curl -X GET http://localhost:4000/subscription \
     -H "Authorization: Bearer YOUR_TOKEN_HERE"
   ```
   ✅ Should return subscription details with caption limits

5. **View API Documentation**:
   - Open: http://localhost:4000/docs
   - ✅ Should show Swagger UI with all endpoints

### Step 8: Test Caption Generation

**Note**: Requires `GOOGLE_API_KEY` to be set in `backend/.env`

1. **Login** through frontend (http://localhost:3000/login)

2. **Navigate to Generator**:
   - Click "Caption Generator" in navbar
   - Or go to: http://localhost:3000/generator

3. **Generate Caption**:
   - Upload an image file
   - Select tone (e.g., "Casual")
   - Select length (e.g., "Medium")
   - Adjust hashtag count
   - Click "Generate Captions"
   - ✅ Should generate captions
   - ✅ Should decrement your caption usage (check account page)

4. **Test Quota Limit**:
   - Generate 10 captions (Free plan limit)
   - Try to generate 11th caption
   - ✅ Should show error: "Caption generation limit reached"

### Step 9: Test Backend Service

#### Test Health Endpoint
```bash
curl http://localhost:5000/health
```
✅ Should return: `{"status":"healthy"}`

#### Test Caption Generation (with auth)
```bash
# First, get a token from login
TOKEN=$(curl -s -X POST http://localhost:4000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword123"}' \
  | jq -r '.access_token')

# Generate caption (replace image.jpg with actual image)
curl -X POST http://localhost:5000/generate-captions \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@image.jpg" \
  -F "fileType=image" \
  -F "tone=casual" \
  -F "length=medium" \
  -F "hashtagCount=5"
```
✅ Should return generated captions

### Step 10: Test Database Integration

```bash
# Open database shell
make db-shell

# Check users
SELECT id, email, full_name, created_at FROM users;

# Check subscriptions
SELECT s.id, u.email, p.name as plan_name, s.status 
FROM subscriptions s
JOIN users u ON s.user_id = u.id
JOIN plans p ON s.plan_id = p.id;

# Check caption usage
SELECT u.email, cu.captions_generated, cu.period_start, cu.period_end
FROM caption_usage cu
JOIN users u ON cu.user_id = u.id;

# Exit
\q
```

✅ Should show:
- Users you created
- Their subscriptions (all should have Free plan)
- Caption usage tracking

## Viewing Logs

### All Services
```bash
make logs
```

### Specific Service
```bash
make logs-auth      # Auth service logs
make logs-backend   # Backend service logs
make logs-frontend  # Frontend service logs
make logs-db        # Database logs
```

## Common Issues & Solutions

### Issue: Services won't start
**Solution**:
```bash
# Check if ports are already in use
netstat -an | grep -E '3000|4000|5000|5432'

# Stop all services and restart
make down
make dev
```

### Issue: Database connection errors
**Solution**:
```bash
# Check database is ready
docker-compose exec postgres pg_isready -U postgres

# View database logs
make logs-db

# Reset database if needed
make db-reset
```

### Issue: Auth service can't connect to database
**Solution**:
- Check `services/auth/.env` has correct DB credentials
- Ensure database container is running: `docker-compose ps postgres`
- Check network: services should be on `caption_network`

### Issue: Frontend can't connect to backend/auth
**Solution**:
- Check environment variables in `docker-compose.yml`
- Ensure `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_AUTH_URL` are correct
- Check CORS settings in auth service

### Issue: Caption generation fails
**Solution**:
- Verify `GOOGLE_API_KEY` is set in `backend/.env`
- Check backend logs: `make logs-backend`
- Ensure you're logged in (JWT token required)

## Complete Test Checklist

Use this checklist to verify everything works:

- [ ] All services start successfully
- [ ] Health checks pass for all services
- [ ] Database initializes with plans
- [ ] User can sign up through frontend
- [ ] User can login through frontend
- [ ] JWT token is stored in cookie
- [ ] User info displays in navbar
- [ ] Account page shows subscription info
- [ ] Auth service API endpoints work
- [ ] Backend health endpoint works
- [ ] Caption generation works (if API key set)
- [ ] Caption usage is tracked
- [ ] Quota limit is enforced
- [ ] Database shows all created data

## Quick Test Script

Run this to quickly test all endpoints:

```bash
#!/bin/bash
echo "Testing Auth Service..."
curl -f http://localhost:4000/health && echo " ✅ Auth OK" || echo " ❌ Auth Failed"

echo "Testing Backend Service..."
curl -f http://localhost:5000/health && echo " ✅ Backend OK" || echo " ❌ Backend Failed"

echo "Testing Frontend..."
curl -f http://localhost:3000 > /dev/null && echo " ✅ Frontend OK" || echo " ❌ Frontend Failed"

echo "Testing Database..."
docker-compose exec -T postgres pg_isready -U postgres && echo " ✅ Database OK" || echo " ❌ Database Failed"
```

## Next Steps

Once local testing passes:
1. ✅ All services working
2. ✅ Authentication flow complete
3. ✅ Database integration verified
4. ✅ Caption generation functional
5. ✅ Quota tracking working

You're ready to proceed with Kubernetes/EKS deployment! 🚀

