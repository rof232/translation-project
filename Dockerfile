FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    gcc \
    python3-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# Copy requirements first for better caching
COPY backend/requirements.txt .

# Install requirements one by one to better identify any issues
RUN pip install --no-cache-dir fastapi uvicorn pydantic python-dotenv httpx
RUN pip install --no-cache-dir python-multipart deep-translator langdetect
RUN pip install --no-cache-dir sentry-sdk[fastapi] prometheus-fastapi-instrumentator
RUN pip install --no-cache-dir psycopg2-binary python-jose[cryptography]
RUN pip install --no-cache-dir rate-limiter newrelic gunicorn uvicorn[standard]

# Copy backend code
COPY backend/ .

# Set environment variables
ENV PORT=8000
ENV HOST=0.0.0.0
ENV PYTHONUNBUFFERED=1

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
