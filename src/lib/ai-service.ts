import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AISettings, TranslationResult, WordPair, WritingStyle } from './types';
import { parseWordPairs } from './utils/parsing';
import { translationCache } from './translation-cache';
import { textAnalysis } from './text-analysis';

export interface AIServiceConfig {
  provider: 'openai' | 'google' | 'anthropic' | 'llama' | 'custom';
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
  selectedProvider: 'google' | 'openai' | 'anthropic' | 'llama';
  google: { apiKey: string; model: string };
  openai: { apiKey: string; model: string };
  anthropic: { apiKey: string; model: string };
  llama: { modelPath: string; model: string };
  custom: { apiKey: string; model: string; endpoint: string };
}

export function getStoredSettings(): AISettings {
  const stored = localStorage.getItem('ai_settings');
  if (!stored) return {
    selectedProvider: 'openai',
    openai: { apiKey: '', model: 'gpt-3.5-turbo' },
    google: { apiKey: '', model: 'gemini-pro' },
    anthropic: { apiKey: '', model: 'claude-3-sonnet' },
    llama: { modelPath: '', model: 'llama-2-7b-chat' },
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
    const cacheKey = `${text}-${from}-${to}`;
    const cached = translationCache.get(cacheKey);
    if (cached) return cached;

    let result: TranslationResult;

    switch (this.config.provider) {
      case 'openai':
        result = await this.translateWithOpenAI(text, from, to);
        break;
      case 'google':
        result = await this.translateWithGoogle(text, from, to);
        break;
      case 'anthropic':
        result = await this.translateWithAnthropic(text, from, to);
        break;
      case 'llama':
        result = await this.translateWithLlama(text, from, to);
        break;
      default:
        throw new Error('Unsupported AI provider');
    }

    translationCache.set(cacheKey, result);
    return result;
  }

  private async translateWithOpenAI(text: string, from: string, to: string): Promise<TranslationResult> {
    const completion = await this.openai.chat.completions.create({
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${from} to ${to}. Maintain the original meaning, tone, and style.`
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
    const prompt = `Translate the following text from ${from} to ${to}:\n\n${text}`;
    
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
          content: `Translate the following text from ${from} to ${to}:\n\n${text}`
        }
      ]
    });

    return {
      translatedText: message.content[0].text,
      wordPairs: [],
      fromCache: false
    };
  }

  private async translateWithLlama(text: string, from: string, to: string): Promise<TranslationResult> {
    if (!this.config.customEndpoint) {
      throw new Error('LLaMA endpoint not configured');
    }

    try {
      const response = await fetch(this.config.customEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          prompt: `Translate the following text from ${from} to ${to}:\n\n${text}`,
          model: this.config.model,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 2000
        })
      });

      if (!response.ok) {
        throw new Error(`LLaMA API error: ${response.statusText}`);
      }

      const result = await response.json();
      const translatedText = result.generated_text || result.response || '';
      const analysis = await textAnalysis(text, translatedText);
      
      return {
        translatedText,
        confidence: 0.85,
        alternatives: [],
        sourceLanguage: from,
        targetLanguage: to,
        wordPairs: parseWordPairs(text, translatedText),
        analysis
      };
    } catch (error) {
      console.error('LLaMA translation error:', error);
      throw new Error('Failed to translate using LLaMA');
    }
  }
}