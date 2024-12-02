from fastapi import FastAPI
from prometheus_fastapi_instrumentator import Instrumentator
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
import newrelic.agent
import os

def init_monitoring(app: FastAPI):
    # Initialize Sentry
    if os.getenv("SENTRY_DSN"):
        sentry_sdk.init(
            dsn=os.getenv("SENTRY_DSN"),
            integrations=[FastApiIntegration()],
            traces_sample_rate=1.0,
            environment=os.getenv("ENVIRONMENT", "production"),
        )

    # Initialize Prometheus metrics
    Instrumentator().instrument(app).expose(app)

    # Initialize New Relic
    if os.getenv("NEW_RELIC_LICENSE_KEY"):
        newrelic.agent.initialize()

    @app.middleware("http")
    async def add_monitoring_headers(request, call_next):
        response = await call_next(request)
        response.headers["X-Response-Time"] = "1.0"  # Example metric
        return response
