"""
خدمة إدارة ذاكرة الترجمة والسياق
"""
from typing import List, Optional
from datetime import datetime
from models.translation_memory import TranslationMemoryEntry, TranslationContext, Character, NovelContext

class TranslationMemoryService:
    def __init__(self):
        self.memory_entries: List[TranslationMemoryEntry] = []
        self.novel_contexts: dict[str, NovelContext] = {}
        
    async def add_entry(self, entry: TranslationMemoryEntry) -> None:
        """إضافة مدخل جديد إلى ذاكرة الترجمة"""
        # البحث عن مدخل مشابه
        for existing in self.memory_entries:
            if existing.original_text == entry.original_text:
                existing.frequency += 1
                existing.last_used = datetime.now()
                return
        self.memory_entries.append(entry)
    
    async def find_similar_translations(
        self,
        text: str,
        context: Optional[TranslationContext] = None,
        threshold: float = 0.8
    ) -> List[TranslationMemoryEntry]:
        """البحث عن ترجمات مشابهة"""
        similar_entries = []
        for entry in self.memory_entries:
            similarity_score = self._calculate_similarity(text, entry.original_text)
            context_score = self._calculate_context_similarity(context, entry.context) if context else 1.0
            
            combined_score = similarity_score * 0.7 + context_score * 0.3
            if combined_score >= threshold:
                entry.confidence_score = combined_score
                similar_entries.append(entry)
        
        return sorted(similar_entries, key=lambda x: (x.confidence_score, x.frequency), reverse=True)
    
    async def add_novel_context(self, novel_title: str, context: NovelContext) -> None:
        """إضافة سياق جديد لرواية"""
        self.novel_contexts[novel_title] = context
    
    async def get_character_translations(self, novel_title: str) -> List[Character]:
        """الحصول على ترجمات الشخصيات في رواية معينة"""
        if novel_title in self.novel_contexts:
            return self.novel_contexts[novel_title].characters
        return []
    
    async def update_context(self, entry_id: int, context: TranslationContext) -> None:
        """تحديث سياق مدخل معين"""
        if 0 <= entry_id < len(self.memory_entries):
            self.memory_entries[entry_id].context = context
    
    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """حساب درجة التشابه بين نصين"""
        # يمكن استخدام خوارزميات مثل Levenshtein distance
        # أو استخدام نماذج التشابه الدلالي
        # هذا تنفيذ بسيط للتوضيح
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        return len(intersection) / len(union) if union else 0
    
    def _calculate_context_similarity(self, context1: TranslationContext, context2: TranslationContext) -> float:
        """حساب درجة التشابه بين سياقين"""
        if not context1 or not context2:
            return 0.0
            
        score = 0.0
        if context1.scene_type == context2.scene_type:
            score += 0.4
        if context1.chapter_number == context2.chapter_number:
            score += 0.2
        
        # مقارنة السياق السابق واللاحق
        prev_similarity = self._calculate_similarity(
            context1.previous_paragraph or "",
            context2.previous_paragraph or ""
        )
        next_similarity = self._calculate_similarity(
            context1.next_paragraph or "",
            context2.next_paragraph or ""
        )
        
        score += (prev_similarity + next_similarity) * 0.2
        return min(score, 1.0)
