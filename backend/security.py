from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
import os
from datetime import datetime, timedelta
from typing import Optional

class RateLimiter:
    def __init__(self, window: int = 900, max_requests: int = 100):
        self.window = window
        self.max_requests = max_requests
        self.requests = {}

    def is_allowed(self, client_id: str) -> bool:
        now = datetime.now().timestamp()
        if client_id not in self.requests:
            self.requests[client_id] = []
        
        # Clean old requests
        self.requests[client_id] = [ts for ts in self.requests[client_id] 
                                  if now - ts < self.window]
        
        if len(self.requests[client_id]) >= self.max_requests:
            return False
        
        self.requests[client_id].append(now)
        return True

rate_limiter = RateLimiter(
    window=int(os.getenv("RATE_LIMIT_WINDOW", "900")),
    max_requests=int(os.getenv("RATE_LIMIT_MAX_REQUESTS", "100"))
)

def init_security(app: FastAPI):
    # CORS configuration
    origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Rate limiting middleware
    @app.middleware("http")
    async def rate_limiting_middleware(request: Request, call_next):
        client_id = request.client.host
        if not rate_limiter.is_allowed(client_id):
            raise HTTPException(status_code=429, detail="Too many requests")
        return await call_next(request)

    # Security headers middleware
    @app.middleware("http")
    async def security_headers_middleware(request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response
