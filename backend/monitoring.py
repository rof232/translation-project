from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
import newrelic.agent
import os

def init_monitoring(app: FastAPI):
    # Initialize Sentry if DSN is provided
    sentry_dsn = os.getenv("SENTRY_DSN")
    if sentry_dsn and sentry_dsn.strip():
        try:
            print(f"Attempting to initialize Sentry with DSN: {sentry_dsn[:20]}...")  # Only print first 20 chars for security
            sentry_sdk.init(
                dsn=sentry_dsn.strip(),  # Ensure no whitespace
                integrations=[FastApiIntegration()],
                traces_sample_rate=1.0,
                environment=os.getenv("ENVIRONMENT", "production"),
            )
            print("Sentry initialization successful")
        except Exception as e:
            print(f"Failed to initialize Sentry. Error: {str(e)}")
            print("Application will continue without Sentry monitoring")

    # Initialize Prometheus metrics
    Instrumentator().instrument(app).expose(app)

    # Initialize New Relic if license key is provided
    new_relic_key = os.getenv("NEW_RELIC_LICENSE_KEY")
    if new_relic_key and new_relic_key.strip():
        try:
            newrelic.agent.initialize()
            print("New Relic initialization successful")
        except Exception as e:
            print(f"Failed to initialize New Relic: {e}")
            print("Application will continue without New Relic monitoring")

    @app.middleware("http")
    async def add_monitoring_headers(request, call_next):
        response = await call_next(request)
        response.headers["X-Response-Time"] = "1.0"  # Example metric
        return response
