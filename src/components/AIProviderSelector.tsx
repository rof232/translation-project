import React, { useState } from 'react';
import { Bot, ChevronDown } from 'lucide-react';
import { AI_PROVIDERS } from '../lib/ai-providers';
import type { AIProvider, AISettings } from '../lib/types';

interface Props {
  settings: AISettings;
  onUpdate: (settings: Partial<AISettings>) => void;
}

export default function AIProviderSelector({ settings, onUpdate }: Props) {
  const [isCustomModel, setIsCustomModel] = useState(false);
  const provider = AI_PROVIDERS[settings.provider];

  const handleProviderChange = (newProvider: AIProvider) => {
    const firstModel = AI_PROVIDERS[newProvider].models[0]?.id;
    onUpdate({ 
      provider: newProvider,
      model: firstModel || ''
    });
    setIsCustomModel(false);
  };

  const handleModelChange = (modelId: string) => {
    if (modelId === 'custom') {
      setIsCustomModel(true);
    } else {
      setIsCustomModel(false);
      onUpdate({ model: modelId });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          مزود الذكاء الاصطناعي
        </label>
        <select
          value={settings.provider}
          onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        >
          {Object.entries(AI_PROVIDERS).map(([id, config]) => (
            <option key={id} value={id}>
              {config.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          النموذج
        </label>
        {provider.customModelSupport ? (
          <div className="space-y-2">
            <select
              value={isCustomModel ? 'custom' : settings.model}
              onChange={(e) => handleModelChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              {provider.models.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
              <option value="custom">نموذج مخصص</option>
            </select>
            
            {isCustomModel && (
              <input
                type="text"
                value={settings.model}
                onChange={(e) => onUpdate({ model: e.target.value })}
                placeholder="أدخل اسم النموذج المخصص"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            )}
          </div>
        ) : (
          <select
            value={settings.model}
            onChange={(e) => onUpdate({ model: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {provider.models.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          مفتاح API
        </label>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => onUpdate({ apiKey: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          placeholder={`أدخل مفتاح ${provider.name}`}
        />
      </div>
    </div>
  );
}