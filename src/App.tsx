import React, { useState, useCallback, useEffect } from 'react';
import { ArrowRightLeft, Loader2, Settings, Globe, ChevronDown } from 'lucide-react';
import LanguageSelector from './components/LanguageSelector';
import TranslationHistory from './components/TranslationHistory';
import ApiKeyModal from './components/ApiKeyModal';
import CharacterPronouns from './components/CharacterPronouns';
import TextWithSelection from './components/TextWithSelection';
import WordPairs from './components/WordPairs';
import AdminControl from './components/AdminControl';
import TermsManager from './components/TermsManager';
import { AIService, getStoredSettings, storeSettings } from './lib/ai-service';
import { getStoredCharacters, storeCharacter, removeCharacter } from './lib/characters';
import type { TranslationHistoryItem, DetectedCharacter, AISettings, WordPair } from './lib/types';
import { QueryClient, QueryClientProvider } from 'react-query';
import TranslationMemory from './components/TranslationMemory';

interface Term {
  id: string;
  original: string;
  translation: string;
  category: string;
  notes?: string;
}

const queryClient = new QueryClient();

function App() {
  const [fromLang, setFromLang] = useState('ar');
  const [toLang, setToLang] = useState('en');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [wordPairs, setWordPairs] = useState<WordPair[]>([]);
  const [selectedWords, setSelectedWords] = useState<WordPair[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [aiService, setAIService] = useState<AIService | null>(null);
  const [aiSettings, setAISettings] = useState<AISettings>(getStoredSettings());
  const [characters, setCharacters] = useState<DetectedCharacter[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [terms, setTerms] = useState<Term[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const settings = getStoredSettings();
    if (settings.apiKey) {
      setAIService(new AIService(settings));
    } else {
      setIsApiKeyModalOpen(true);
    }

    const storedCharacters = getStoredCharacters();
    setCharacters(
      Object.entries(storedCharacters).map(([name, gender]) => ({
        name,
        gender
      }))
    );

    const savedTerms = localStorage.getItem('translationTerms');
    if (savedTerms) {
      setTerms(JSON.parse(savedTerms));
    }
  }, []);

  const handleAISettingsSubmit = (settings: AISettings) => {
    setAISettings(settings);
    setAIService(new AIService(settings));
    storeSettings(settings);
  };

  const handleAddCharacter = (name: string) => {
    if (!characters.some(char => char.name.toLowerCase() === name.toLowerCase())) {
      setCharacters(prev => [...prev, { name }]);
    }
  };

  const handleRemoveCharacter = (name: string) => {
    setCharacters(prev => prev.filter(char => char.name !== name));
    removeCharacter(name);
  };

  const handleCharacterUpdate = (name: string, gender: 'male' | 'female') => {
    storeCharacter(name, gender);
    setCharacters(prev =>
      prev.map(char =>
        char.name === name ? { ...char, gender } : char
      )
    );
  };

  const handleSwapLanguages = () => {
    setFromLang(toLang);
    setToLang(fromLang);
    setInputText(translatedText);
    setTranslatedText(inputText);
    setWordPairs([]);
    setSelectedWords([]);
  };

  const handleWordSelect = async (word: string) => {
    if (!aiService) return;

    setIsLoading(true);
    try {
      const result = await aiService.translate(word, fromLang, toLang);
      const newPair = {
        source: word,
        target: result.translatedText.trim()
      };
      setSelectedWords(prev => [...prev, newPair]);
    } catch (error) {
      console.error('Word translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: inputText,
          source_lang: fromLang,
          target_lang: toLang,
          api_key: aiSettings.apiKey,
          terms: terms.map(term => ({
            original: term.original,
            translation: term.translation,
            category: term.category
          }))
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Translation failed');
      }

      const data = await response.json();
      setTranslatedText(data.translated_text);
      
      const historyItem: TranslationHistoryItem = {
        id: Date.now(),
        originalText: inputText,
        translatedText: data.translated_text,
        from: fromLang,
        to: toLang,
        timestamp: new Date(),
        provider: aiSettings.provider,
        model: aiSettings.model
      };
      
      setHistory(prev => [historyItem, ...prev]);
      localStorage.setItem('translationHistory', JSON.stringify([historyItem, ...history]));
      
    } catch (error) {
      console.error('Translation error:', error);
      setError(error instanceof Error ? error.message : 'Translation failed');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, fromLang, toLang, aiSettings, terms, history]);

  const handleHistorySelect = (item: TranslationHistoryItem) => {
    setFromLang(item.from);
    setToLang(item.to);
    setInputText(item.originalText);
    setTranslatedText(item.translatedText);
    setWordPairs(item.wordPairs || []);
    setSelectedWords([]);
    
    if (item.characters) {
      setCharacters(
        item.characters.map(char => ({
          name: char.name,
          gender: char.gender
        }))
      );
    }
  };

  const handleTermAdd = (term: Term) => {
    setTerms([...terms, term]);
    localStorage.setItem('translationTerms', JSON.stringify([...terms, term]));
  };

  const handleTermUpdate = (updatedTerm: Term) => {
    const newTerms = terms.map(term => 
      term.id === updatedTerm.id ? updatedTerm : term
    );
    setTerms(newTerms);
    localStorage.setItem('translationTerms', JSON.stringify(newTerms));
  };

  const handleTermDelete = (termId: string) => {
    const newTerms = terms.filter(term => term.id !== termId);
    setTerms(newTerms);
    localStorage.setItem('translationTerms', JSON.stringify(newTerms));
  };

  const applyStoredTerms = (text: string) => {
    let modifiedText = text;
    terms.forEach(term => {
      const regex = new RegExp(term.original, 'gi');
      modifiedText = modifiedText.replace(regex, term.translation);
    });
    return modifiedText;
  };

  const LanguageSelector = ({ value, onChange, label, className }) => {
    return (
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">
            <Globe className="w-4 h-4" />
          </span>
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`appearance-none bg-[#0f172a]/80 text-gray-200 pl-4 pr-10 py-2.5 rounded-xl border border-white/10 focus:ring-2 focus:ring-purple-400/50 focus:outline-none transition-all duration-300 cursor-pointer hover:border-white/20 ${className}`}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            <option value="ar" className="bg-[#0f172a]/80 text-gray-200">العربية</option>
            <option value="en" className="bg-[#0f172a]/80 text-gray-200">English</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          {/* Header */}
          <header className="flex justify-between items-center mb-12 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-500 via-indigo-400 to-cyan-400 inline-block text-transparent bg-clip-text mb-2">
                مترجم AI
              </h1>
              <p className="text-gray-400 text-sm">مترجم ذكي مع ذاكرة ترجمة متقدمة</p>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 border border-white/10 group"
              title="Settings"
            >
              <Settings className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </button>
          </header>

          <main className="space-y-10">
            {/* Translation Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Input */}
              <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl transition-all duration-300 hover:bg-white/[0.07]">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-200 mb-2">النص المصدر</h2>
                  <p className="text-sm text-gray-400">أدخل النص المراد ترجمته</p>
                </div>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full h-48 bg-slate-900/50 text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none resize-none border border-white/10 transition duration-300"
                  placeholder="أدخل النص هنا..."
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                />
                <div className="mt-6 flex justify-between items-center">
                  <LanguageSelector
                    value={fromLang}
                    onChange={setFromLang}
                    label="من"
                    className="bg-slate-900/50 text-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none border border-white/10 transition duration-300 min-w-[120px]"
                  />
                  <button
                    onClick={handleTranslate}
                    disabled={isLoading || !inputText.trim() || !aiService}
                    className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl transition duration-300 font-semibold disabled:opacity-50 shadow-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>جاري الترجمة...</span>
                      </div>
                    ) : !aiService ? (
                      'يرجى إضافة مفتاح API أولاً'
                    ) : (
                      'ترجم'
                    )}
                  </button>
                </div>
              </div>

              {/* Output */}
              <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl transition-all duration-300 hover:bg-white/[0.07]">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-200 mb-2">النص المترجم</h2>
                  <p className="text-sm text-gray-400">النتيجة النهائية للترجمة</p>
                </div>
                <div className="h-48 bg-slate-900/50 text-gray-200 rounded-xl p-4 border border-white/10">
                  <TextWithSelection
                    text={translatedText}
                    dir={toLang === 'ar' ? 'rtl' : 'ltr'}
                    onWordSelect={handleWordSelect}
                    style={{ fontFamily: 'Cairo, sans-serif' }}
                  />
                </div>
                <div className="mt-6 flex justify-between items-center">
                  <LanguageSelector
                    value={toLang}
                    onChange={setToLang}
                    label="إلى"
                    className="bg-slate-900/50 text-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none border border-white/10 transition duration-300 min-w-[120px]"
                  />
                  <button
                    onClick={handleSwapLanguages}
                    className="bg-slate-900/50 hover:bg-white/10 text-gray-200 px-6 py-3 rounded-xl transition duration-300 border border-white/10 font-semibold flex items-center gap-2"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    تبديل
                  </button>
                </div>
              </div>
            </div>

            {/* Translation Memory */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                  ذاكرة الترجمة
                </h2>
                <p className="text-gray-400">الترجمات السابقة والمشابهة</p>
              </div>
              <div className="grid gap-4">
                {wordPairs.map((pair, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center py-4 px-6 bg-slate-900/50 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300"
                  >
                    <span className="text-cyan-400 font-medium">{pair.target}</span>
                    <span className="text-indigo-400 font-medium">{pair.source}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                  إحصائيات الترجمة
                </h2>
                <p className="text-gray-400">معلومات حول أداء الترجمة</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  <p className="text-gray-400 text-sm mb-2">الكلمات المترجمة</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                    {wordPairs.length}
                  </p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  <p className="text-gray-400 text-sm mb-2">وقت الترجمة</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                    0ms
                  </p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  <p className="text-gray-400 text-sm mb-2">الدقة</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                    0%
                  </p>
                </div>
                <div className="bg-slate-900/50 p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all duration-300">
                  <p className="text-gray-400 text-sm mb-2">اللغات المدعومة</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
                    2
                  </p>
                </div>
              </div>
            </div>

            {/* Characters */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                  الشخصيات
                </h2>
                <p className="text-gray-400">إدارة أسماء الشخصيات وترجماتها</p>
              </div>
              <CharacterPronouns
                characters={characters}
                onCharacterUpdate={handleCharacterUpdate}
                onAddCharacter={handleAddCharacter}
                onRemoveCharacter={handleRemoveCharacter}
              />
            </div>

            {/* Translation History */}
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
                  سجل الترجمة
                </h2>
                <p className="text-gray-400">الترجمات السابقة</p>
              </div>
              <TranslationHistory
                history={history}
                onSelect={handleHistorySelect}
              />
            </div>

            <div className="mt-8">
              <TranslationMemory />
            </div>
          </main>

          <footer className="mt-16 text-center text-gray-400 bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10">
            <p className="text-sm">2024 مترجم AI - جميع الحقوق محفوظة</p>
          </footer>
        </div>

        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() => setIsApiKeyModalOpen(false)}
          onSubmit={handleAISettingsSubmit}
          settings={aiSettings}
        />
        <ApiKeyModal 
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSubmit={(settings) => {
            setAISettings(settings);
            setShowSettings(false);
          }}
          settings={aiSettings}
        />
        <AdminControl />
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500/90 backdrop-blur-xl text-white px-6 py-3 rounded-xl shadow-lg">
            {error}
          </div>
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;