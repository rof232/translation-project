import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (settings: any) => void;
  settings: any;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  settings,
}) => {
  const [provider, setProvider] = useState(settings.provider || 'openai');
  const [apiKey, setApiKey] = useState(settings[provider]?.apiKey || '');
  const [model, setModel] = useState(settings[provider]?.model || '');
  const [endpoint, setEndpoint] = useState(settings[provider]?.endpoint || '');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSettings = {
      ...settings,
      provider,
      [provider]: {
        apiKey,
        model,
        endpoint
      }
    };
    onSubmit(newSettings);
  };

  const getModelOptions = () => {
    switch (provider) {
      case 'openai':
        return [
          { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' },
          { value: 'gpt-4', label: 'GPT-4' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
        ];
      case 'google':
        return [
          { value: 'gemini-pro', label: 'Gemini Pro' },
          { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' }
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-haiku', label: 'Claude 3 Haiku' }
        ];
      case 'llama':
        return [
          { value: 'llama-2-70b-chat', label: 'LLaMA-2 70B Chat' },
          { value: 'llama-2-13b-chat', label: 'LLaMA-2 13B Chat' },
          { value: 'llama-2-7b-chat', label: 'LLaMA-2 7B Chat' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#24283b] rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            إعدادات API
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#1a1b26] transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-400 mb-2">مزود الخدمة</label>
            <select
              value={provider}
              onChange={(e) => {
                setProvider(e.target.value);
                setApiKey(settings[e.target.value]?.apiKey || '');
                setModel(settings[e.target.value]?.model || getModelOptions()[0]?.value || '');
                setEndpoint(settings[e.target.value]?.endpoint || '');
              }}
              className="w-full bg-[#1a1b26] text-gray-200 px-4 py-2 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              <option value="openai">OpenAI</option>
              <option value="google">Google AI</option>
              <option value="anthropic">Anthropic</option>
              <option value="llama">LLaMA</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">النموذج</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#1a1b26] text-gray-200 px-4 py-2 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              {getModelOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">مفتاح API</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#1a1b26] text-gray-200 px-4 py-2 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="أدخل مفتاح API"
            />
          </div>

          {provider === 'llama' && (
            <div>
              <label className="block text-gray-400 mb-2">عنوان API</label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="w-full bg-[#1a1b26] text-gray-200 px-4 py-2 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none"
                placeholder="https://your-llama-endpoint/v1/generate"
              />
            </div>
          )}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg hover:bg-[#1a1b26] transition-colors text-gray-400"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:opacity-90 transition-opacity"
            >
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;