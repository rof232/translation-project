from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import httpx
import os
from dotenv import load_dotenv
from deep_translator import GoogleTranslator
from langdetect import detect
from monitoring import init_monitoring
from security import init_security

load_dotenv()

app = FastAPI(title="AI Translator API")

# Initialize monitoring and security
init_monitoring(app)
init_security(app)

# CORS configuration
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return {"status": "ok"}

class TranslationRequest(BaseModel):
    text: str = Field(..., description="Text to translate")
    source_lang: Optional[str] = Field(None, description="Source language code (ISO 639-1)")
    target_lang: str = Field(..., description="Target language code (ISO 639-1)")
    api_key: Optional[str] = Field(None, description="OpenAI API key")
    terms: Optional[List[dict]] = Field(None, description="Custom translation terms")

class TranslationResponse(BaseModel):
    translated_text: str = Field(..., description="Translated text")
    detected_language: Optional[str] = Field(None, description="Detected source language")
    confidence: Optional[float] = Field(None, description="Translation confidence score")

async def detect_language(text: str) -> str:
    try:
        return detect(text)
    except:
        return "en"

async def translate_with_google(text: str, source_lang: str, target_lang: str) -> str:
    try:
        translator = GoogleTranslator(source=source_lang, target=target_lang)
        return translator.translate(text)
    except:
        return ""

async def translate_with_openai(text: str, source_lang: str, target_lang: str, api_key: str) -> str:
    try:
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers=headers,
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [
                        {
                            "role": "system", 
                            "content": f"You are a professional translator. Translate the following text from {source_lang} to {target_lang}. Maintain the original meaning, tone, and formatting. Provide only the translation without any additional text."
                        },
                        {"role": "user", "content": text}
                    ]
                }
            )

        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"].strip()
        return ""
    except:
        return ""

async def apply_terms(text: str, terms: list[dict]) -> str:
    if not terms:
        return text
    
    for term in terms:
        if 'original' in term and 'translation' in term:
            text = text.replace(term['original'], term['translation'])
    return text

@app.get("/")
async def root():
    return {"message": "Welcome to AI Translator API"}

@app.post("/translate", response_model=TranslationResponse)
async def translate_text(request: TranslationRequest):
    try:
        source_lang = request.source_lang
        if not source_lang:
            source_lang = await detect_language(request.text)

        translated_text = ""
        confidence = 0.0

        if request.api_key:
            translated_text = await translate_with_openai(
                request.text, source_lang, request.target_lang, request.api_key
            )
            confidence = 0.9 if translated_text else 0.0

        if not translated_text:
            translated_text = await translate_with_google(
                request.text, source_lang, request.target_lang
            )
            confidence = 0.7 if translated_text else 0.0

        if request.terms:
            translated_text = await apply_terms(translated_text, request.terms)

        if not translated_text:
            raise HTTPException(status_code=500, detail="Translation failed")

        return TranslationResponse(
            translated_text=translated_text,
            detected_language=source_lang,
            confidence=confidence
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
