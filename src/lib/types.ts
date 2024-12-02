export interface Character {
  name: string;
  gender: 'male' | 'female';
  timestamp: Date;
}

export interface WordPair {
  source: string;
  target: string;
}

export interface TranslationResult {
  translatedText: string;
  wordPairs: WordPair[];
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
  provider: AIProvider;
  model: string;
  apiKey: string;
}