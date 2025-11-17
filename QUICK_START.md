# Quick Start - Local Testing

## 🚀 Fastest Way to Test Everything

### 1. Initial Setup (One-time)
```bash
make setup
```

### 2. Start All Services
```bash
make dev
```

Wait ~30 seconds for all services to start.

### 3. Open in Browser
- **Frontend**: http://localhost:3000
- **Auth API Docs**: http://localhost:4000/docs
- **pgAdmin**: http://localhost:5050 (admin@captiongen.local / admin)

### 4. Quick Test
```bash
# Test all services
make test-all

# Check status
make status
```

### 5. Test User Flow
1. Go to http://localhost:3000
2. Click "Try Free" → Sign up with test@example.com
3. Login with your credentials
4. Go to "Caption Generator" → Upload image → Generate
5. Check "Account" page → See usage tracked

## 📋 Essential Commands

```bash
# Start services
make dev              # Development mode (hot reload)
make prod             # Production mode

# Stop services
make down

# View logs
make logs             # All services
make logs-auth        # Auth service only
make logs-backend     # Backend only
make logs-frontend    # Frontend only

# Database
make db-shell         # Open PostgreSQL shell
make db-reset         # Reset database (⚠️ deletes data)

# Testing
make test-all         # Test all health endpoints
make status           # Show service status
```

## 🔍 Verify Everything Works

### Check Services
```bash
curl http://localhost:4000/health  # Auth service
curl http://localhost:5000/health  # Backend service
curl http://localhost:3000          # Frontend
```

### Check Database
```bash
make db-shell
# Inside psql:
SELECT * FROM plans;  # Should show 4 plans
SELECT COUNT(*) FROM users;  # Should show number of users
\q  # Exit
```

## ⚠️ Troubleshooting

**Services won't start?**
```bash
make down
make dev
```

**Database errors?**
```bash
make db-reset  # ⚠️ This deletes all data
```

**Port already in use?**
```bash
# Check what's using ports
netstat -an | grep -E '3000|4000|5000|5432'
# Stop conflicting services or change ports in docker-compose.yml
```

## 📚 Full Documentation

- **Detailed Testing Guide**: See `TESTING_GUIDE.md`
- **Migration Info**: See `MIGRATION_GUIDE.md` (if exists)
- **Makefile Help**: Run `make help`

## ✅ Success Criteria

You know everything works when:
- ✅ All services show "Up" in `make status`
- ✅ Can sign up and login through frontend
- ✅ Can generate captions (if GOOGLE_API_KEY set)
- ✅ Account page shows usage tracking
- ✅ Database has users and subscriptions

**Ready for Kubernetes deployment!** 🎉

