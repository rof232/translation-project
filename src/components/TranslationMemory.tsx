import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from 'react-query';
import axios from 'axios';
import { Book, MessageCircle, Tag, Clock, Search } from 'lucide-react';

interface Character {
  name_original: string;
  name_translated: string;
  description?: string;
  aliases: string[];
}

interface TranslationContext {
  previous_paragraph?: string;
  next_paragraph?: string;
  scene_type?: string;
  chapter_number?: number;
  chapter_title?: string;
  tags?: string[];
}

interface TranslationMemoryEntry {
  original_text: string;
  translated_text: string;
  context: TranslationContext;
  frequency: number;
  last_used: string;
  characters: Character[];
  novel_title?: string;
  chapter_id?: string;
  confidence_score: number;
}

const TranslationMemory: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [threshold, setThreshold] = useState(0.8);
  const [context, setContext] = useState<TranslationContext>({
    previous_paragraph: '',
    next_paragraph: '',
    scene_type: 'dialogue',
    chapter_title: '',
    tags: []
  });

  // استعلام عن الترجمات المشابهة
  const { data: similarTranslations, refetch } = useQuery(
    ['similar-translations', searchText, context],
    async () => {
      if (!searchText) return [];
      const response = await axios.post('/translation-memory/find-similar', {
        text: searchText,
        context,
        threshold
      });
      return response.data.translations;
    },
    { enabled: Boolean(searchText) }
  );

  // استعلام عن الشخصيات
  const { data: characters } = useQuery(
    ['characters', context.chapter_title],
    async () => {
      if (!context.chapter_title) return [];
      const response = await axios.get(`/novel-context/characters/${context.chapter_title}`);
      return response.data.characters;
    },
    { enabled: Boolean(context.chapter_title) }
  );

  // إضافة مدخل جديد
  const addEntryMutation = useMutation(async (entry: TranslationMemoryEntry) => {
    await axios.post('/translation-memory/add', entry);
  });

  const handleAddEntry = async (translatedText: string) => {
    const entry: TranslationMemoryEntry = {
      original_text: searchText,
      translated_text: translatedText,
      context,
      frequency: 1,
      last_used: new Date().toISOString(),
      characters: [],
      tags: [],
      novel_title: context.chapter_title,
      confidence_score: 1.0
    };
    await addEntryMutation.mutateAsync(entry);
    refetch();
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
          ذاكرة الترجمة والسياق
        </h2>
        <p className="text-gray-400">إدارة وبحث الترجمات السابقة مع السياق</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="relative mb-6">
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="البحث في الترجمات السابقة..."
            className="w-full bg-slate-900/50 text-gray-200 rounded-xl px-5 py-3 pl-12 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none border border-white/10 transition duration-300"
          />
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/10">
            <label className="block text-sm text-gray-400 mb-2">نسبة التشابه</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{Math.round(threshold * 100)}%</span>
              <span>100%</span>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-xl p-4 border border-white/10">
            <label className="block text-sm text-gray-400 mb-2">نوع المشهد</label>
            <select
              value={context.scene_type}
              onChange={(e) => setContext({ ...context, scene_type: e.target.value })}
              className="w-full bg-slate-800/50 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none border border-white/10 transition duration-300"
            >
              <option value="dialogue">حوار</option>
              <option value="description">وصف</option>
              <option value="action">حدث</option>
            </select>
          </div>
        </div>
      </div>

      {/* Context Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-cyan-400" />
            السياق السابق
          </h3>
          <textarea
            value={context.previous_paragraph}
            onChange={(e) => setContext({ ...context, previous_paragraph: e.target.value })}
            placeholder="أدخل الفقرة السابقة..."
            className="w-full h-32 bg-slate-900/50 text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none resize-none border border-white/10 transition duration-300"
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-indigo-400" />
            السياق اللاحق
          </h3>
          <textarea
            value={context.next_paragraph}
            onChange={(e) => setContext({ ...context, next_paragraph: e.target.value })}
            placeholder="أدخل الفقرة التالية..."
            className="w-full h-32 bg-slate-900/50 text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none resize-none border border-white/10 transition duration-300"
          />
        </div>
      </div>

      {/* Novel Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2 mb-4">
            <Book className="w-5 h-5 text-cyan-400" />
            معلومات الرواية
          </h3>
          <input
            type="text"
            value={context.chapter_title}
            onChange={(e) => setContext({ ...context, chapter_title: e.target.value })}
            placeholder="عنوان الفصل..."
            className="w-full bg-slate-800/50 text-gray-200 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none border border-white/10 transition duration-300"
          />
        </div>

        <div className="bg-slate-900/50 rounded-xl p-4 border border-white/10">
          <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2 mb-4">
            <Tag className="w-5 h-5 text-indigo-400" />
            الوسوم
          </h3>
          <input
            type="text"
            placeholder="أضف وسماً (اضغط Enter)"
            className="w-full bg-slate-800/50 text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none border border-white/10 transition duration-300"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                setContext({
                  ...context,
                  tags: [...context.tags, e.currentTarget.value]
                });
                e.currentTarget.value = '';
              }
            }}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {context.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg text-sm flex items-center gap-1"
              >
                {tag}
                <button
                  onClick={() => setContext({
                    ...context,
                    tags: context.tags.filter((_, i) => i !== index)
                  })}
                  className="hover:text-indigo-200 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Similar Translations */}
      <div className="bg-slate-900/50 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-medium text-gray-200 flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-cyan-400" />
          الترجمات المشابهة
        </h3>
        <div className="space-y-4">
          {similarTranslations && similarTranslations.length > 0 ? (
            similarTranslations.map((entry: TranslationMemoryEntry, index: number) => (
              <div
                key={index}
                className="bg-slate-800/50 rounded-xl p-4 border border-white/10 hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-cyan-400 font-medium">النص الأصلي</span>
                  <span className="text-xs text-gray-400">نسبة التشابه: {(entry.confidence_score * 100).toFixed(1)}%</span>
                </div>
                <p className="text-gray-300 mb-4">{entry.original_text}</p>
                <div className="flex justify-between items-start">
                  <span className="text-indigo-400 font-medium">الترجمة</span>
                  <span className="text-xs text-gray-400">{new Date(entry.last_used).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-300">{entry.translated_text}</p>
                <button
                  onClick={() => handleAddEntry(entry.translated_text)}
                  className="bg-cyan-400/20 text-cyan-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1 mt-2 hover:bg-cyan-400/30 transition-colors"
                >
                  إضافة
                </button>
              </div>
            ))
          ) : (
            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/10 hover:bg-white/5 transition-all duration-300">
              <div className="flex justify-between items-start mb-2">
                <span className="text-cyan-400 font-medium">النص الأصلي</span>
                <span className="text-xs text-gray-400">نسبة التشابه: 95%</span>
              </div>
              <p className="text-gray-300 mb-4">مثال للنص الأصلي...</p>
              <div className="flex justify-between items-start">
                <span className="text-indigo-400 font-medium">الترجمة</span>
                <span className="text-xs text-gray-400">2024/01/15</span>
              </div>
              <p className="text-gray-300">مثال للترجمة...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslationMemory;
