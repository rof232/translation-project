FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set environment variables
ENV PORT=8000
ENV HOST=0.0.0.0
ENV NODE_ENV=production
ENV LOG_LEVEL=info
ENV PYTHONUNBUFFERED=1

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD curl -f http://localhost:${PORT}/health || exit 1

# Expose port
EXPOSE ${PORT}

# Create non-root user
RUN adduser --disabled-password --gecos "" appuser
USER appuser

# Start the application
CMD ["sh", "-c", "uvicorn main:app --host ${HOST} --port ${PORT} --log-level ${LOG_LEVEL}"]
