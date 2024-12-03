"""
نموذج لتخزين وإدارة الترجمات المتكررة والسياق
"""
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class TranslationContext(BaseModel):
    """سياق النص المترجم"""
    previous_paragraph: Optional[str] = None
    next_paragraph: Optional[str] = None
    scene_type: Optional[str] = None  # حوار، وصف، معركة، الخ
    chapter_number: Optional[int] = None
    chapter_title: Optional[str] = None

class Character(BaseModel):
    """معلومات الشخصية في الرواية"""
    name_original: str
    name_translated: str
    description: Optional[str] = None
    aliases: List[str] = []

class TranslationMemoryEntry(BaseModel):
    """مدخل في ذاكرة الترجمة"""
    original_text: str
    translated_text: str
    context: TranslationContext
    frequency: int = 1
    last_used: datetime = datetime.now()
    characters: List[Character] = []
    tags: List[str] = []
    novel_title: Optional[str] = None
    chapter_id: Optional[str] = None
    confidence_score: float = 1.0

class NovelContext(BaseModel):
    """سياق الرواية الكامل"""
    title: str
    characters: List[Character]
    glossary: dict[str, str]  # مصطلحات خاصة بالرواية
    genre: Optional[str] = None
    translation_style: Optional[str] = None  # رسمي، عامي، الخ
