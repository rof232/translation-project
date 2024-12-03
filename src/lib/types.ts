export interface Character {
  name: string;
  gender: 'male' | 'female';
  timestamp: Date;
}

export interface WordPair {
  source: string;
  target: string;
}

export interface WritingStyle {
  formality: 'formal' | 'informal' | 'mixed';
  tone: 'serious' | 'humorous' | 'dramatic' | 'neutral';
  complexity: 'simple' | 'moderate' | 'complex';
  descriptiveness: 'minimal' | 'moderate' | 'detailed';
  dialogueStyle: 'direct' | 'indirect' | 'mixed';
}

export interface CacheEntry {
  originalText: string;
  translatedText: string;
  writingStyle: WritingStyle;
  timestamp: number;
  provider: string;
  model: string;
}

export interface TranslationCache {
  [key: string]: CacheEntry;
}

export interface AutoCorrection {
  original: string;
  corrected: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  confidence: number;
}

export interface TranslationResult {
  translatedText: string;
  wordPairs: WordPair[];
  corrections?: AutoCorrection[];
  writingStyle?: WritingStyle;
  fromCache?: boolean;
}

export interface TranslationHistoryItem {
  id: number;
  from: string;
  to: string;
  originalText: string;
  translatedText: string;
  timestamp: Date;
  characters?: Character[];
  provider: AIProvider;
  model: string;
  wordPairs?: WordPair[];
}

export interface DetectedCharacter {
  name: string;
  gender?: 'male' | 'female';
}

export type AIProvider = 'gemini' | 'openai' | 'anthropic' | 'custom';

export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
}

export interface AIProviderConfig {
  name: string;
  models: AIModel[];
  customModelSupport?: boolean;
}

export interface Term {
  id: string;
  original: string;
  translation: string;
  category: string;
  notes?: string;
}

export interface AISettings {
  selectedProvider: 'openai' | 'google' | 'anthropic';
  openai: { apiKey: string; model: string };
  google: { apiKey: string; model: string };
  anthropic: { apiKey: string; model: string };
}