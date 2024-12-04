import { AIProviderConfig } from './types';

export const AI_PROVIDERS: Record<string, AIProviderConfig> = {
  gemini: {
    name: 'Google AI',
    models: [
      { id: 'gemini-pro', name: 'Gemini Pro', provider: 'gemini' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', provider: 'gemini' },
      { id: 'text-bison', name: 'Text Bison', provider: 'gemini' },
      { id: 'chat-bison', name: 'Chat Bison', provider: 'gemini' },
      { id: 'code-bison', name: 'Code Bison', provider: 'gemini' }
    ],
    customModelSupport: true
  },
  openai: {
    name: 'OpenAI',
    models: [
      { id: 'gpt-4-turbo-preview', name: 'GPT-4 Turbo', provider: 'openai' },
      { id: 'gpt-4-vision-preview', name: 'GPT-4 Vision', provider: 'openai' },
      { id: 'gpt-4', name: 'GPT-4', provider: 'openai' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai' },
      { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', provider: 'openai' }
    ],
    customModelSupport: true
  },
  anthropic: {
    name: 'Anthropic',
    models: [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', provider: 'anthropic' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', provider: 'anthropic' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', provider: 'anthropic' },
      { id: 'claude-2.1', name: 'Claude 2.1', provider: 'anthropic' },
      { id: 'claude-instant-1.2', name: 'Claude Instant', provider: 'anthropic' }
    ],
    customModelSupport: true
  },
  custom: {
    name: 'نموذج مخصص',
    models: [],
    customModelSupport: true
  }
};

export const getProviderModels = (provider: string): string[] => {
  return AI_PROVIDERS[provider]?.models.map(model => model.id) || [];
};

export const supportsCustomModels = (provider: string): boolean => {
  return AI_PROVIDERS[provider]?.customModelSupport || false;
};