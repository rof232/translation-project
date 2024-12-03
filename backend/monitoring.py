import logging
import sys
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from time import time
import json

def setup_logging(log_file: Optional[str] = None) -> logging.Logger:
    """Setup logging configuration"""
    logger = logging.getLogger("novel_translator")
    logger.setLevel(logging.INFO)
    
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    # File handler if specified
    if log_file:
        log_path = Path(log_file)
        log_path.parent.mkdir(parents=True, exist_ok=True)
        file_handler = logging.FileHandler(log_file)
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    return logger

class RequestLoggingMiddleware:
    """Middleware for logging requests"""
    def __init__(self, app: FastAPI, logger: logging.Logger):
        self.app = app
        self.logger = logger

    async def __call__(self, request: Request, call_next):
        start_time = time()
        response = await call_next(request)
        process_time = time() - start_time
        
        log_dict = {
            "path": request.url.path,
            "method": request.method,
            "process_time": f"{process_time:.2f}s",
            "status_code": response.status_code
        }
        
        self.logger.info(f"Request processed: {json.dumps(log_dict)}")
        return response

def init_monitoring(app: FastAPI, log_file: Optional[str] = None):
    """Initialize monitoring with request logging and CORS"""
    logger = setup_logging(log_file)
    
    # Add request logging middleware
    app.middleware("http")(RequestLoggingMiddleware(app, logger))
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:1420"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    logger.info("Monitoring system initialized")
