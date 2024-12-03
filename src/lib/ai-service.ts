import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import type { AISettings, TranslationResult, WordPair, WritingStyle } from './types';
import { parseWordPairs } from './utils/parsing';
import { translationCache } from './translation-cache';
import { textAnalysis } from './text-analysis';

export interface AISettings {
  selectedProvider: 'google' | 'openai' | 'anthropic';
  google: { apiKey: string; model: string };
  openai: { apiKey: string; model: string };
  anthropic: { apiKey: string; model: string };
}

export function getStoredSettings(): AISettings {
  const stored = localStorage.getItem('aiSettings');
  return stored ? JSON.parse(stored) : {
    selectedProvider: 'openai',
    openai: { apiKey: '', model: 'gpt-3.5-turbo' },
    google: { apiKey: '', model: 'gemini-pro' },
    anthropic: { apiKey: '', model: 'claude-2' }
  };
}

export function storeSettings(settings: AISettings) {
  localStorage.setItem('aiSettings', JSON.stringify(settings));
}

export class AIService {
  private settings: AISettings;
  private geminiClient?: GoogleGenerativeAI;
  private openaiClient?: OpenAI;
  private anthropicClient?: Anthropic;

  constructor(settings: AISettings) {
    this.settings = settings;
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const provider = this.settings.selectedProvider;
      switch (provider) {
        case 'google':
          if (this.settings.google.apiKey) {
            this.geminiClient = new GoogleGenerativeAI(this.settings.google.apiKey);
          }
          break;
        case 'openai':
          if (this.settings.openai.apiKey) {
            this.openaiClient = new OpenAI({ apiKey: this.settings.openai.apiKey });
          }
          break;
        case 'anthropic':
          if (this.settings.anthropic.apiKey) {
            this.anthropicClient = new Anthropic({ apiKey: this.settings.anthropic.apiKey });
          }
          break;
      }
    } catch (error) {
      console.error('Error initializing AI client:', error);
      throw new Error('Failed to initialize AI service');
    }
  }

  async translate(text: string, from: string = 'en', to: string = 'ar'): Promise<TranslationResult> {
    try {
      // التحقق من التخزين المؤقت أولاً
      const cached = translationCache.get(text, from, to);
      if (cached) {
        return {
          translatedText: cached.translatedText,
          wordPairs: [], // يمكن تخزين أزواج الكلمات في الكاش أيضاً
          writingStyle: cached.writingStyle,
          fromCache: true
        };
      }

      // تحليل أسلوب النص الأصلي
      const sourceStyle = await textAnalysis.analyzeWritingStyle(text);

      // الحصول على الترجمة من مزود الذكاء الاصطناعي
      const translatedText = await this.getTranslationFromProvider(text, from, to, sourceStyle);

      // تصحيح النص المترجم
      const corrections = await textAnalysis.autoCorrect(translatedText, to);
      
      // تطبيق التصحيحات
      let finalText = translatedText;
      corrections.forEach(correction => {
        if (correction.confidence > 0.8) {
          finalText = finalText.replace(correction.original, correction.corrected);
        }
      });

      // تحليل أسلوب النص المترجم للتأكد من تطابقه مع النص الأصلي
      const targetStyle = await textAnalysis.analyzeWritingStyle(finalText);

      const result: TranslationResult = {
        translatedText: finalText,
        wordPairs: [], // يمكن إضافة منطق لاستخراج أزواج الكلمات
        corrections,
        writingStyle: targetStyle
      };

      // تخزين النتيجة في الكاش
      translationCache.set(text, from, to, {
        originalText: text,
        translatedText: finalText,
        writingStyle: targetStyle,
        provider: this.settings.selectedProvider,
        model: this.settings.selectedProvider === 'openai' ? this.settings.openai.model : this.settings.selectedProvider === 'google' ? this.settings.google.model : this.settings.anthropic.model
      });

      return result;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  }

  private async getTranslationFromProvider(
    text: string,
    from: string,
    to: string,
    sourceStyle: WritingStyle
  ): Promise<string> {
    const prompt = this.buildStyleAwarePrompt(text, from, to, sourceStyle);
    
    switch (this.settings.selectedProvider) {
      case 'openai':
        return this.translateWithOpenAI(prompt);
      case 'google':
        return this.translateWithGoogle(prompt);
      case 'anthropic':
        return this.translateWithAnthropic(prompt);
      default:
        throw new Error('Unsupported AI provider');
    }
  }

  private buildStyleAwarePrompt(
    text: string,
    from: string,
    to: string,
    style: WritingStyle
  ): string {
    return `Translate the following text from ${from} to ${to}, maintaining this writing style:
- Formality: ${style.formality}
- Tone: ${style.tone}
- Complexity: ${style.complexity}
- Descriptiveness: ${style.descriptiveness}
- Dialogue Style: ${style.dialogueStyle}

Text to translate:
${text}`;
  }

  private async translateWithOpenAI(prompt: string): Promise<string> {
    if (!this.openaiClient) throw new Error('OpenAI client not initialized');
    const completion = await this.openaiClient.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: this.settings.openai.model,
    });
    return completion.choices[0]?.message?.content || '';
  }

  private async translateWithGoogle(prompt: string): Promise<string> {
    if (!this.geminiClient) throw new Error('Google AI client not initialized');
    const geminiModel = this.geminiClient.getGenerativeModel({ model: this.settings.google.model });
    const geminiResult = await geminiModel.generateContent(prompt);
    return geminiResult.response.text();
  }

  private async translateWithAnthropic(prompt: string): Promise<string> {
    if (!this.anthropicClient) throw new Error('Anthropic client not initialized');
    const message = await this.anthropicClient.messages.create({
      model: this.settings.anthropic.model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
    });
    return message.content[0].text;
  }
}