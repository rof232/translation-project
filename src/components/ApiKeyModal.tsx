import React, { useState } from 'react';
import { X, Key, BrainCircuit } from 'lucide-react';

interface ApiSettings {
  openai?: {
    apiKey: string;
    model: string;
  };
  google?: {
    apiKey: string;
    model: string;
  };
  anthropic?: {
    apiKey: string;
    model: string;
  };
  selectedProvider: 'openai' | 'google' | 'anthropic';
}

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (settings: ApiSettings) => void;
  settings: ApiSettings;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  settings,
}) => {
  const [currentSettings, setCurrentSettings] = useState<ApiSettings>(settings || {
    selectedProvider: 'openai',
    openai: { apiKey: '', model: 'gpt-3.5-turbo' },
    google: { apiKey: '', model: 'gemini-pro' },
    anthropic: { apiKey: '', model: 'claude-2' }
  });

  if (!isOpen) return null;

  const handleProviderChange = (provider: ApiSettings['selectedProvider']) => {
    setCurrentSettings({ ...currentSettings, selectedProvider: provider });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(currentSettings);
  };

  const updateProviderSettings = (
    provider: ApiSettings['selectedProvider'],
    field: 'apiKey' | 'model',
    value: string
  ) => {
    setCurrentSettings({
      ...currentSettings,
      [provider]: {
        ...currentSettings[provider],
        [field]: value
      }
    });
  };

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      models: [
        { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
        { id: 'gpt-4', name: 'GPT-4' },
        { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }
      ]
    },
    {
      id: 'google',
      name: 'Google AI',
      models: [
        { id: 'gemini-pro', name: 'Gemini Pro' },
        { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' }
      ]
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      models: [
        { id: 'claude-2', name: 'Claude 2' },
        { id: 'claude-instant', name: 'Claude Instant' }
      ]
    }
  ] as const;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#24283b] rounded-xl p-8 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-3">
            <BrainCircuit className="w-8 h-8" />
            إعدادات نماذج الذكاء الاصطناعي
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[#1a1b26] transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Provider Selection */}
          <div className="grid grid-cols-3 gap-4">
            {providers.map((provider) => (
              <button
                key={provider.id}
                type="button"
                onClick={() => handleProviderChange(provider.id as ApiSettings['selectedProvider'])}
                className={`p-4 rounded-xl border transition-all ${
                  currentSettings.selectedProvider === provider.id
                    ? 'border-purple-400 bg-purple-400/10'
                    : 'border-[#414868] hover:border-purple-400/50'
                }`}
              >
                <h3 className="text-lg font-medium text-gray-200">{provider.name}</h3>
                <p className="text-sm text-gray-400 mt-1">
                  {currentSettings[provider.id]?.apiKey ? 'تم تكوين API' : 'لم يتم تكوين API'}
                </p>
              </button>
            ))}
          </div>

          {/* Active Provider Settings */}
          <div className="bg-[#1a1b26] rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-3 text-purple-400 mb-4">
              <Key className="w-5 h-5" />
              <h3 className="text-lg font-medium">
                إعدادات {providers.find(p => p.id === currentSettings.selectedProvider)?.name}
              </h3>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">مفتاح API</label>
              <input
                type="password"
                value={currentSettings[currentSettings.selectedProvider]?.apiKey || ''}
                onChange={(e) => updateProviderSettings(currentSettings.selectedProvider, 'apiKey', e.target.value)}
                className="w-full bg-[#24283b] text-gray-200 px-4 py-2 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none"
                placeholder="أدخل مفتاح API الخاص بك"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">النموذج</label>
              <select
                value={currentSettings[currentSettings.selectedProvider]?.model || ''}
                onChange={(e) => updateProviderSettings(currentSettings.selectedProvider, 'model', e.target.value)}
                className="w-full bg-[#24283b] text-gray-200 px-4 py-2 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none"
                dir="ltr"
              >
                {providers
                  .find(p => p.id === currentSettings.selectedProvider)
                  ?.models.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg hover:bg-[#1a1b26] transition-colors text-gray-400"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-400 to-purple-400 text-white hover:opacity-90 transition-opacity"
            >
              حفظ التغييرات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyModal;