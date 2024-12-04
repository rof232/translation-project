import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AISettings, TranslationResult, WordPair, WritingStyle } from './types';
import { parseWordPairs } from './utils/parsing';
import { translationCache } from './translation-cache';
import { textAnalysis } from './text-analysis';

export interface AIServiceConfig {
  provider: 'openai' | 'google' | 'anthropic' | 'custom';
  apiKey: string;
  model: string;
  temperature?: number;
  maxTokens?: number;
  customEndpoint?: string;
}

export const DEFAULT_CONFIG: AIServiceConfig = {
  provider: 'openai',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 2000
};

export interface AISettings {
  selectedProvider: 'google' | 'openai' | 'anthropic';
  google: { apiKey: string; model: string };
  openai: { apiKey: string; model: string };
  anthropic: { apiKey: string; model: string };
  custom: { apiKey: string; model: string; endpoint: string };
}

export function getStoredSettings(): AISettings {
  const stored = localStorage.getItem('ai_settings');
  if (!stored) return {
    provider: 'openai',
    openai: { apiKey: '', model: 'gpt-3.5-turbo' },
    google: { apiKey: '', model: 'gemini-pro' },
    anthropic: { apiKey: '', model: 'claude-3-sonnet' },
    custom: { apiKey: '', model: '', endpoint: '' }
  };
  
  try {
    return JSON.parse(stored);
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function storeSettings(settings: AISettings) {
  localStorage.setItem('ai_settings', JSON.stringify(settings));
}

export class AIService {
  private config: AIServiceConfig;
  private openai: any;
  private googleAI: any;
  private anthropic: any;

  constructor(config: AIServiceConfig) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    if (config.provider === 'openai' && config.apiKey) {
      const { OpenAI } = require('openai');
      this.openai = new OpenAI({ apiKey: config.apiKey });
    }
    
    if (config.provider === 'google' && config.apiKey) {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      this.googleAI = new GoogleGenerativeAI(config.apiKey);
    }
    
    if (config.provider === 'anthropic' && config.apiKey) {
      const Anthropic = require('@anthropic-ai/sdk');
      this.anthropic = new Anthropic({ apiKey: config.apiKey });
    }
  }

  async translate(text: string, from: string, to: string): Promise<TranslationResult> {
    switch (this.config.provider) {
      case 'openai':
        return this.translateWithOpenAI(text, from, to);
      case 'google':
        return this.translateWithGoogle(text, from, to);
      case 'anthropic':
        return this.translateWithAnthropic(text, from, to);
      default:
        throw new Error('غير مدعوم: ' + this.config.provider);
    }
  }

  private async translateWithOpenAI(text: string, from: string, to: string): Promise<TranslationResult> {
    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `أنت مترجم محترف. قم بترجمة النص من ${from} إلى ${to} مع الحفاظ على المعنى والأسلوب.`
        },
        { role: 'user', content: text }
      ],
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens
    });

    return {
      translatedText: completion.choices[0].message.content,
      wordPairs: [],
      fromCache: false
    };
  }

  private async translateWithGoogle(text: string, from: string, to: string): Promise<TranslationResult> {
    const model = this.googleAI.getGenerativeModel({ model: this.config.model });
    const prompt = `ترجم النص التالي من ${from} إلى ${to}:\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    return {
      translatedText: response.text(),
      wordPairs: [],
      fromCache: false
    };
  }

  private async translateWithAnthropic(text: string, from: string, to: string): Promise<TranslationResult> {
    const message = await this.anthropic.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens,
      messages: [
        {
          role: 'user',
          content: `ترجم النص التالي من ${from} إلى ${to}:\n\n${text}`
        }
      ]
    });

    return {
      translatedText: message.content[0].text,
      wordPairs: [],
      fromCache: false
    };
  }
}