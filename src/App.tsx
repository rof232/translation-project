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

interface Term {
  id: string;
  original: string;
  translation: string;
  category: string;
  notes?: string;
}

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
            className={`appearance-none bg-[#1a1b26] text-gray-200 pl-4 pr-10 py-2.5 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none transition-all duration-200 cursor-pointer hover:border-purple-400 ${className}`}
            style={{ fontFamily: 'Cairo, sans-serif' }}
          >
            <option value="ar" className="bg-[#1a1b26] text-gray-200">العربية</option>
            <option value="en" className="bg-[#1a1b26] text-gray-200">English</option>
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1a1b26] text-gray-200">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 inline-block text-transparent bg-clip-text mb-2">مترجم AI</h1>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-[#24283b] transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
        </header>

        <main className="space-y-8">
          <TermsManager
            terms={terms}
            onTermAdd={handleTermAdd}
            onTermUpdate={handleTermUpdate}
            onTermDelete={handleTermDelete}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#24283b] rounded-xl p-6 shadow-lg border border-[#414868]">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-48 bg-[#1a1b26] text-gray-200 rounded-lg p-4 focus:ring-2 focus:ring-purple-400 focus:outline-none resize-none border border-[#414868] transition duration-200"
                placeholder="أدخل النص هنا..."
                style={{ fontFamily: 'Cairo, sans-serif' }}
              />
              <div className="mt-4 flex justify-between items-center">
                <LanguageSelector
                  value={fromLang}
                  onChange={setFromLang}
                  label="ترجم من"
                  className="bg-[#1a1b26] text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none border border-[#414868] transition duration-200"
                />
                <button
                  onClick={handleTranslate}
                  disabled={isLoading || !inputText.trim() || !aiService}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-2 rounded-lg transition duration-200 font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      جاري الترجمة...
                    </>
                  ) : !aiService ? (
                    'يرجى إضافة مفتاح API أولاً'
                  ) : (
                    'ترجم'
                  )}
                </button>
              </div>
            </div>

            <div className="bg-[#24283b] rounded-xl p-6 shadow-lg border border-[#414868]">
              <div className="h-48 bg-[#1a1b26] text-gray-200 rounded-lg p-4 overflow-auto border border-[#414868]">
                <TextWithSelection
                  text={translatedText}
                  dir={toLang === 'ar' ? 'rtl' : 'ltr'}
                  onWordSelect={handleWordSelect}
                  style={{ fontFamily: 'Cairo, sans-serif' }}
                />
              </div>
              <div className="mt-4 flex justify-between items-center">
                <LanguageSelector
                  value={toLang}
                  onChange={setToLang}
                  label="إلى"
                  className="bg-[#1a1b26] text-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:outline-none border border-[#414868] transition duration-200"
                />
                <button
                  onClick={handleSwapLanguages}
                  className="bg-[#1a1b26] hover:bg-[#2a2d46] text-gray-200 px-8 py-2 rounded-lg transition duration-200 border border-[#414868] font-semibold"
                >
                  تبديل
                </button>
              </div>
            </div>
          </div>

          {wordPairs.map((pair, index) => (
            <div key={index} className="flex justify-between items-center py-2 hover:bg-[#1a1b26] transition-colors px-4 rounded">
              <span className="text-purple-400">{pair.target}</span>
              <span className="text-blue-400">{pair.source}</span>
            </div>
          ))}
          {!wordPairs.length && null}

          <div className="bg-[#24283b] rounded-xl p-6 shadow-lg border border-[#414868]">
            <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-6">إحصائيات الترجمة</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-[#1a1b26] p-4 rounded-lg border border-[#414868]">
                <p className="text-gray-400 text-sm mb-1">الكلمات المترجمة</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{wordPairs.length}</p>
              </div>
              <div className="bg-[#1a1b26] p-4 rounded-lg border border-[#414868]">
                <p className="text-gray-400 text-sm mb-1">وقت الترجمة</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">0ms</p>
              </div>
              <div className="bg-[#1a1b26] p-4 rounded-lg border border-[#414868]">
                <p className="text-gray-400 text-sm mb-1">الدقة</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">0%</p>
              </div>
              <div className="bg-[#1a1b26] p-4 rounded-lg border border-[#414868]">
                <p className="text-gray-400 text-sm mb-1">اللغات المدعومة</p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">2</p>
              </div>
            </div>
          </div>

          <div className="bg-[#24283b] rounded-xl p-6 shadow-lg border border-[#414868]">
            <CharacterPronouns
              characters={characters}
              onCharacterUpdate={handleCharacterUpdate}
              onAddCharacter={handleAddCharacter}
              onRemoveCharacter={handleRemoveCharacter}
            />
          </div>

          <div className="bg-[#24283b] rounded-xl p-6 shadow-lg border border-[#414868]">
            <TranslationHistory
              history={history}
              onSelect={handleHistorySelect}
            />
          </div>
        </main>

        <footer className="mt-12 text-center text-gray-400">
          <p className="text-sm"> 2024 مترجم AI - جميع الحقوق محفوظة</p>
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
        <div className="fixed top-0 left-0 w-full bg-red-500 text-white p-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
}

export default App;