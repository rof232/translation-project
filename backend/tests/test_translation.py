import pytest
from fastapi.testclient import TestClient
from main import app
from typing import Dict
import time

client = TestClient(app)

@pytest.fixture
def sample_translation_request() -> Dict:
    return {
        "text": "Hello world",
        "target_lang": "ar",
        "terms": [
            {"original": "world", "translation": "عالم", "category": "general"}
        ]
    }

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}

def test_translate_text(sample_translation_request):
    response = client.post("/translate", json=sample_translation_request)
    assert response.status_code == 200
    data = response.json()
    assert "translated_text" in data
    assert "detected_language" in data

def test_invalid_language():
    request = {
        "text": "Hello",
        "target_lang": "invalid_lang"
    }
    response = client.post("/translate", json=request)
    assert response.status_code == 400

def test_empty_text():
    request = {
        "text": "",
        "target_lang": "ar"
    }
    response = client.post("/translate", json=request)
    assert response.status_code == 400
    assert "error" in response.json()

def test_very_long_text():
    request = {
        "text": "hello " * 1000,  # Very long text
        "target_lang": "ar"
    }
    response = client.post("/translate", json=request)
    assert response.status_code == 400
    assert "error" in response.json()

def test_special_characters():
    request = {
        "text": "Hello! @#$%^&*()",
        "target_lang": "ar"
    }
    response = client.post("/translate", json=request)
    assert response.status_code == 200
    assert "translated_text" in response.json()

def test_rate_limiting():
    # Reset rate limit before test
    time.sleep(1)
    # Make requests up to the limit
    for _ in range(10):  # Reduced number of requests
        response = client.get("/health")
        assert response.status_code == 200
    
    # Next request should be rate limited
    response = client.get("/health")
    assert response.status_code == 429
    assert "error" in response.json()
