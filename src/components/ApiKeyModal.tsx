import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (settings: { apiKey: string; model: string }) => void;
  settings: { apiKey: string; model: string };
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  settings,
}) => {
  const [apiKey, setApiKey] = useState(settings.apiKey || '');
  const [model, setModel] = useState(settings.model || 'gpt-3.5-turbo');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ apiKey, model });
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
            <label className="block text-gray-400 mb-2">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-[#1a1b26] text-gray-200 px-4 py-2 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none"
              placeholder="Enter your API key"
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">النموذج</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-[#1a1b26] text-gray-200 px-4 py-2 rounded-lg border border-[#414868] focus:ring-2 focus:ring-purple-400 focus:outline-none"
            >
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
            </select>
          </div>

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