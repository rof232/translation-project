import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ArrowRightLeft, Loader2, Settings, Globe, ChevronDown, Book, BarChart, Edit, Wand2 } from 'lucide-react';
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
import type { TranslationHistoryItem, DetectedCharacter, AISettings, WordPair, TranslationResult, WritingStyle, AutoCorrection } from './lib/types';
import { QueryClient, QueryClientProvider } from 'react-query';
import TranslationMemory from './components/TranslationMemory';
import NovelGlossary from './components/NovelGlossary';
import ProgressTracker from './components/ProgressTracker';
import TextEditor from './components/TextEditor';

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
  const [writingStyle, setWritingStyle] = useState<WritingStyle | null>(null);
  const [corrections, setCorrections] = useState<AutoCorrection[]>([]);
  const [isCacheEnabled, setIsCacheEnabled] = useState(true);

  useEffect(() => {
    const settings = getStoredSettings();
    const currentProvider = settings[settings.selectedProvider];
    if (currentProvider?.apiKey) {
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
    if (!aiService || !inputText.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await aiService.translate(inputText, fromLang, toLang);
      
      setTranslatedText(result.translatedText);
      setWordPairs(result.wordPairs);
      setWritingStyle(result.writingStyle || null);
      setCorrections(result.corrections || []);

      // إضافة إلى السجل
      const historyItem: TranslationHistoryItem = {
        timestamp: new Date().toISOString(),
        fromLang,
        toLang,
        originalText: inputText,
        translatedText: result.translatedText,
        wordPairs: result.wordPairs,
        writingStyle: result.writingStyle,
        fromCache: result.fromCache
      };

      setHistory(prev => [historyItem, ...prev]);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء الترجمة');
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

  const handleSettingsSave = (settings: AISettings) => {
    setAISettings(settings);
    storeSettings(settings);
    setShowSettings(false);
    
    // Update AIService with new settings
    const currentProvider = settings[settings.selectedProvider];
    if (currentProvider?.apiKey) {
      setAIService(new AIService(settings));
    }
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

  const renderStyleAndCorrections = () => {
    if (!writingStyle && (!corrections || corrections.length === 0)) return null;

    return (
      <div className="mt-4 space-y-4">
        {writingStyle && (
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">تحليل الأسلوب</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">الرسمية:</span>
                <span className="mr-2">{writingStyle.formality}</span>
              </div>
              <div>
                <span className="text-gray-400">النبرة:</span>
                <span className="mr-2">{writingStyle.tone}</span>
              </div>
              <div>
                <span className="text-gray-400">التعقيد:</span>
                <span className="mr-2">{writingStyle.complexity}</span>
              </div>
              <div>
                <span className="text-gray-400">الوصفية:</span>
                <span className="mr-2">{writingStyle.descriptiveness}</span>
              </div>
              <div>
                <span className="text-gray-400">أسلوب الحوار:</span>
                <span className="mr-2">{writingStyle.dialogueStyle}</span>
              </div>
            </div>
          </div>
        )}

        {corrections && corrections.length > 0 && (
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-2 text-cyan-400">التصحيحات المقترحة</h3>
            <div className="space-y-2">
              {corrections.map((correction, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-red-400">{correction.original}</span>
                  <span className="mx-2">→</span>
                  <span className="text-green-400">{correction.corrected}</span>
                  <span className="text-gray-400 text-xs">
                    ({Math.round(correction.confidence * 100)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <nav className="bg-white/5 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <Link to="/" className="flex items-center px-3 py-2 text-gray-200 hover:text-cyan-400">
                  <Wand2 className="mr-2" />
                  المترجم الذكي
                </Link>
                <Link to="/glossary" className="flex items-center px-3 py-2 text-gray-200 hover:text-cyan-400">
                  <Book className="mr-2" />
                  المصطلحات
                </Link>
                <Link to="/progress" className="flex items-center px-3 py-2 text-gray-200 hover:text-cyan-400">
                  <BarChart className="mr-2" />
                  التقدم
                </Link>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-md text-gray-200 hover:text-cyan-400 hover:bg-white/5"
                >
                  <Settings className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="container mx-auto px-6 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={
              <div className="space-y-8">
                {/* Translation Area */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Input */}
                  <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-200 mb-2">النص المصدر</h2>
                      <p className="text-sm text-gray-400">أدخل نص رواية الويب المراد ترجمته</p>
                    </div>
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full h-48 bg-slate-900/50 text-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none resize-none border border-white/10"
                      placeholder="أدخل النص هنا..."
                      dir="auto"
                    />
                    <div className="mt-6 flex justify-between items-center">
                      <LanguageSelector
                        value={fromLang}
                        onChange={setFromLang}
                        label="من"
                        className="bg-slate-900/50 text-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none border border-white/10"
                      />
                      <button
                        onClick={handleTranslate}
                        disabled={isLoading || !inputText.trim() || !aiService}
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>جاري الترجمة...</span>
                          </>
                        ) : !aiService ? (
                          'يرجى إضافة مفتاح API أولاً'
                        ) : (
                          <>
                            <Wand2 className="w-5 h-5" />
                            <span>ترجم باستخدام AI</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Output */}
                  <div className="group bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-200 mb-2">النص المترجم</h2>
                      <p className="text-sm text-gray-400">الترجمة المقترحة من AI</p>
                    </div>
                    <div className="h-48 bg-slate-900/50 text-gray-200 rounded-xl p-4 border border-white/10">
                      <TextWithSelection
                        text={translatedText}
                        dir={toLang === 'ar' ? 'rtl' : 'ltr'}
                        onWordSelect={handleWordSelect}
                      />
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                      <LanguageSelector
                        value={toLang}
                        onChange={setToLang}
                        label="إلى"
                        className="bg-slate-900/50 text-gray-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-cyan-400/50 focus:outline-none border border-white/10"
                      />
                      <button
                        onClick={handleSwapLanguages}
                        className="bg-slate-900/50 hover:bg-white/10 text-gray-200 px-6 py-3 rounded-xl border border-white/10 font-semibold flex items-center gap-2"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                        تبديل
                      </button>
                    </div>
                  </div>
                </div>

                {/* Translation Memory and Characters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <TranslationMemory />
                  <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 shadow-2xl">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold text-gray-200 mb-2">شخصيات الرواية</h2>
                      <p className="text-sm text-gray-400">إدارة أسماء وألقاب الشخصيات</p>
                    </div>
                    <CharacterPronouns
                      characters={characters}
                      onCharacterUpdate={handleCharacterUpdate}
                      onAddCharacter={handleAddCharacter}
                      onRemoveCharacter={handleRemoveCharacter}
                    />
                  </div>
                </div>
              </div>
            } />
            <Route path="/glossary" element={<NovelGlossary />} />
            <Route path="/progress" element={<ProgressTracker />} />
          </Routes>
        </main>
      </div>

      {showSettings && (
        <ApiKeyModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSubmit={handleSettingsSave}
          settings={aiSettings}
        />
      )}
      {translatedText && renderStyleAndCorrections()}
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          <label className="flex items-center space-x-2 rtl:space-x-reverse">
            <input
              type="checkbox"
              checked={isCacheEnabled}
              onChange={(e) => setIsCacheEnabled(e.target.checked)}
              className="rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
            />
            <span className="text-sm text-gray-400">تمكين التخزين المؤقت</span>
          </label>
        </div>
      </div>
    </Router>
  );
}

export default App;