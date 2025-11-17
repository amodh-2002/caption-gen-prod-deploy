from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, timedelta
import os
import jwt
import bcrypt
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Caption Gen Auth Service",
    description="Authentication and subscription management microservice",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_NAME = os.getenv("DB_NAME", "caption_gen")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))

security = HTTPBearer()

# Database connection helper
@contextmanager
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        cursor_factory=RealDictCursor
    )
    try:
        yield conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        conn.close()

# Pydantic models
class SignupRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=1)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    created_at: datetime

class SubscriptionResponse(BaseModel):
    plan_name: str
    status: str
    captions_remaining: int
    captions_limit: int

class ValidateTokenRequest(BaseModel):
    token: str

class DecrementCaptionRequest(BaseModel):
    user_id: str

# Helper functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str, email: str) -> dict:
    """Create JWT token for user"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": expiration,
        "iat": datetime.utcnow()
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": JWT_EXPIRATION_HOURS * 3600
    }

def decode_jwt_token(token: str) -> dict:
    """Decode and verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated user"""
    token = credentials.credentials
    payload = decode_jwt_token(token)
    return payload

# Routes
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT 1")
        return {"status": "healthy", "service": "auth"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database connection failed: {str(e)}"
        )

@app.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def signup(request: SignupRequest):
    """Register a new user"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Check if user already exists
            cursor.execute(
                "SELECT id FROM users WHERE email = %s",
                (request.email,)
            )
            if cursor.fetchone():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            # Hash password
            password_hash = hash_password(request.password)
            
            # Create user
            cursor.execute(
                """
                INSERT INTO users (email, password_hash, full_name, created_at)
                VALUES (%s, %s, %s, %s)
                RETURNING id, email, full_name, created_at
                """,
                (request.email, password_hash, request.full_name, datetime.utcnow())
            )
            user = cursor.fetchone()
            
            # Get free plan
            cursor.execute(
                "SELECT id FROM plans WHERE name = %s",
                ("Free",)
            )
            plan = cursor.fetchone()
            
            if not plan:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Default plan not found"
                )
            
            # Create subscription
            cursor.execute(
                """
                INSERT INTO subscriptions (user_id, plan_id, status, start_date)
                VALUES (%s, %s, %s, %s)
                """,
                (user['id'], plan['id'], 'active', datetime.utcnow())
            )
            
            # Create JWT token
            token_data = create_jwt_token(user['id'], user['email'])
            
            return TokenResponse(
                **token_data,
                user={
                    "id": user['id'],
                    "email": user['email'],
                    "full_name": user['full_name']
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signup failed: {str(e)}"
        )

@app.post("/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Authenticate user and return token"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get user
            cursor.execute(
                "SELECT id, email, password_hash, full_name FROM users WHERE email = %s",
                (request.email,)
            )
            user = cursor.fetchone()
            
            if not user or not verify_password(request.password, user['password_hash']):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            
            # Create JWT token
            token_data = create_jwt_token(user['id'], user['email'])
            
            return TokenResponse(
                **token_data,
                user={
                    "id": user['id'],
                    "email": user['email'],
                    "full_name": user['full_name']
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login failed: {str(e)}"
        )

@app.post("/validate-token")
async def validate_token(request: ValidateTokenRequest):
    """Validate JWT token and return user info"""
    try:
        payload = decode_jwt_token(request.token)
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, email, full_name FROM users WHERE id = %s",
                (payload['sub'],)
            )
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found"
                )
            
            return {
                "valid": True,
                "user": {
                    "id": user['id'],
                    "email": user['email'],
                    "full_name": user['full_name']
                }
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token validation failed: {str(e)}"
        )

@app.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """Get current authenticated user information"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "SELECT id, email, full_name, created_at FROM users WHERE id = %s",
                (current_user['sub'],)
            )
            user = cursor.fetchone()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return UserResponse(**user)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )

@app.get("/subscription", response_model=SubscriptionResponse)
async def get_subscription(current_user: dict = Depends(get_current_user)):
    """Get user's current subscription and usage"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get subscription with plan details
            cursor.execute(
                """
                SELECT 
                    p.name as plan_name,
                    s.status,
                    p.caption_limit,
                    COALESCE(cu.captions_generated, 0) as captions_generated
                FROM subscriptions s
                JOIN plans p ON s.plan_id = p.id
                LEFT JOIN caption_usage cu ON cu.user_id = s.user_id 
                    AND cu.period_start <= %s AND cu.period_end >= %s
                WHERE s.user_id = %s AND s.status = 'active'
                ORDER BY s.start_date DESC
                LIMIT 1
                """,
                (datetime.utcnow(), datetime.utcnow(), current_user['sub'])
            )
            subscription = cursor.fetchone()
            
            if not subscription:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No active subscription found"
                )
            
            captions_remaining = subscription['caption_limit'] - subscription['captions_generated']
            
            return SubscriptionResponse(
                plan_name=subscription['plan_name'],
                status=subscription['status'],
                captions_remaining=captions_remaining,
                captions_limit=subscription['caption_limit']
            )
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch subscription: {str(e)}"
        )

@app.post("/caption/decrement")
async def decrement_caption_usage(
    request: DecrementCaptionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Decrement caption usage for a user (internal service call)"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get current period usage
            now = datetime.utcnow()
            period_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            next_month = period_start.replace(month=period_start.month + 1) if period_start.month < 12 else period_start.replace(year=period_start.year + 1, month=1)
            
            cursor.execute(
                """
                SELECT id, captions_generated 
                FROM caption_usage 
                WHERE user_id = %s AND period_start = %s
                """,
                (request.user_id, period_start)
            )
            usage = cursor.fetchone()
            
            if usage:
                # Update existing usage
                cursor.execute(
                    """
                    UPDATE caption_usage 
                    SET captions_generated = captions_generated + 1,
                        last_generated_at = %s
                    WHERE id = %s
                    RETURNING captions_generated
                    """,
                    (now, usage['id'])
                )
            else:
                # Create new usage record
                cursor.execute(
                    """
                    INSERT INTO caption_usage (user_id, period_start, period_end, captions_generated, last_generated_at)
                    VALUES (%s, %s, %s, 1, %s)
                    RETURNING captions_generated
                    """,
                    (request.user_id, period_start, next_month, now)
                )
            
            result = cursor.fetchone()
            
            return {
                "success": True,
                "captions_generated": result['captions_generated']
            }
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update usage: {str(e)}"
        )

@app.get("/caption/check-limit")
async def check_caption_limit(current_user: dict = Depends(get_current_user)):
    """Check if user has remaining captions"""
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Get subscription and usage
            cursor.execute(
                """
                SELECT 
                    p.caption_limit,
                    COALESCE(cu.captions_generated, 0) as captions_generated
                FROM subscriptions s
                JOIN plans p ON s.plan_id = p.id
                LEFT JOIN caption_usage cu ON cu.user_id = s.user_id 
                    AND cu.period_start <= %s AND cu.period_end >= %s
                WHERE s.user_id = %s AND s.status = 'active'
                ORDER BY s.start_date DESC
                LIMIT 1
                """,
                (datetime.utcnow(), datetime.utcnow(), current_user['sub'])
            )
            result = cursor.fetchone()
            
            if not result:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No active subscription found"
                )
            
            has_remaining = result['captions_generated'] < result['caption_limit']
            captions_remaining = result['caption_limit'] - result['captions_generated']
            
            return {
                "has_remaining": has_remaining,
                "captions_remaining": captions_remaining,
                "captions_limit": result['caption_limit'],
                "captions_used": result['captions_generated']
            }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to check limit: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=4000)

