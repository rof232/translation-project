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

def test_context_aware_translation():
    request = {
        "text": "I love apple products",
        "target_lang": "ar",
        "context": "technology"
    }
    response = client.post("/translate", json=request)
    assert response.status_code == 200
    data = response.json()
    assert "translated_text" in data
    assert "context_applied" in data

def test_multiple_terms():
    request = {
        "text": "The cat and dog are playing in the garden",
        "target_lang": "ar",
        "terms": [
            {"original": "cat", "translation": "قطة", "category": "animals"},
            {"original": "dog", "translation": "كلب", "category": "animals"},
            {"original": "garden", "translation": "حديقة", "category": "places"}
        ]
    }
    response = client.post("/translate", json=request)
    assert response.status_code == 200
    data = response.json()
    assert "translated_text" in data
    assert "terms_applied" in data

def test_concurrent_requests():
    import concurrent.futures
    
    def make_request():
        return client.post("/translate", json={"text": "Hello", "target_lang": "ar"})
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(make_request) for _ in range(5)]
        responses = [f.result() for f in futures]
    
    assert all(r.status_code == 200 for r in responses)

def test_ai_provider_selection():
    providers = ["google", "openai", "anthropic"]
    for provider in providers:
        request = {
            "text": "Hello world",
            "target_lang": "ar",
            "ai_provider": provider
        }
        response = client.post("/translate", json=request)
        assert response.status_code in [200, 400]  # 400 if provider not configured

def test_language_detection():
    texts = {
        "مرحبا": "ar",
        "Hello": "en",
        "Bonjour": "fr",
        "こんにちは": "ja"
    }
    for text, expected_lang in texts.items():
        request = {
            "text": text,
            "target_lang": "en"
        }
        response = client.post("/translate", json=request)
        assert response.status_code == 200
        data = response.json()
        assert data["detected_language"] == expected_lang
