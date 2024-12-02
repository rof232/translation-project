from fastapi import FastAPI
import logging

def init_monitoring(app: FastAPI):
    """Initialize basic local monitoring and logging"""
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    logger.info("Local monitoring initialized")
