# Auth Service

Authentication and subscription management microservice for Caption Generator.

## Features

- User registration and login
- JWT-based authentication
- Subscription plan management
- Caption usage tracking
- Token validation for other services

## Tech Stack

- FastAPI
- PostgreSQL
- JWT for authentication
- bcrypt for password hashing

## API Endpoints

### Public Endpoints

- `POST /signup` - Register new user
- `POST /login` - Authenticate user
- `POST /validate-token` - Validate JWT token (for service-to-service)
- `GET /health` - Health check

### Protected Endpoints (require Bearer token)

- `GET /me` - Get current user info
- `GET /subscription` - Get user's subscription details
- `GET /caption/check-limit` - Check remaining caption quota
- `POST /caption/decrement` - Decrement caption usage

## Environment Variables

See `env.example` for required configuration:

- Database connection settings
- JWT secret and expiration
- CORS origins
- Server host and port

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env with your settings

# Run the service
python app.py
# or
uvicorn app:app --reload --port 4000
```

## Docker

```bash
# Build image
docker build -t auth-service .

# Run container
docker run -p 4000:4000 --env-file .env auth-service
```

## API Documentation

Once running, visit:

- Swagger UI: http://localhost:4000/docs
- ReDoc: http://localhost:4000/redoc
