"""
المترجم الذكي - خدمة الترجمة المتقدمة

هذا الملف يحتوي على نقاط النهاية الرئيسية لخدمة الترجمة. يدعم:
- ترجمة النصوص باستخدام مزودي الذكاء الاصطناعي المختلفين
- الترجمة السياقية
- إدارة المصطلحات
- كشف اللغة تلقائياً
- تحديد معدل الاستخدام
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
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

# Test endpoint
@app.get("/test")
async def test():
    return {"status": "ok", "message": "Test endpoint is working"}

class Term(BaseModel):
    original: str
    translation: str

class TranslationRequest(BaseModel):
    """نموذج طلب الترجمة

    Attributes:
        text (str): النص المراد ترجمته
        target_lang (str): رمز اللغة الهدف (مثل 'ar' للعربية)
        source_lang (str, optional): رمز اللغة المصدر (اختياري، يتم الكشف عنه تلقائياً)
        context (str, optional): سياق النص للترجمة الأكثر دقة
        terms (List[Term], optional): قائمة المصطلحات المخصصة للترجمة
        ai_provider (str, optional): مزود الذكاء الاصطناعي المفضل (google, openai, anthropic)
    """
    text: str
    target_lang: str
    source_lang: Optional[str] = None
    context: Optional[str] = None
    terms: Optional[List[Term]] = None
    ai_provider: Optional[str] = "google"

class TranslationResponse(BaseModel):
    translated_text: str
    detected_language: Optional[str]
    confidence: Optional[float]

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

async def apply_terms(text: str, terms: list[Term]) -> str:
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
async def translate_text(request: TranslationRequest) -> Dict:
    """ترجمة النص مع دعم السياق والمصطلحات المخصصة

    Args:
        request (TranslationRequest): طلب الترجمة مع كافة المعلمات

    Returns:
        Dict: نتيجة الترجمة تتضمن:
            - translated_text: النص المترجم
            - detected_language: اللغة المكتشفة للنص المصدر
            - context_applied: إذا تم تطبيق السياق
            - terms_applied: قائمة المصطلحات التي تم تطبيقها

    Raises:
        HTTPException: في حالة وجود خطأ في الطلب أو الترجمة
    """
    try:
        source_lang = request.source_lang
        if not source_lang:
            source_lang = await detect_language(request.text)

        translated_text = ""
        confidence = 0.0

        if request.ai_provider == "openai":
            translated_text = await translate_with_openai(
                request.text, source_lang, request.target_lang, "YOUR_OPENAI_API_KEY"
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
