import React from 'react';
import { Clock, Database, Wand2 } from 'lucide-react';

interface HistoryItem {
  id: number;
  fromLang: string;
  toLang: string;
  originalText: string;
  translatedText: string;
  timestamp: Date;
  fromCache?: boolean;
  writingStyle?: {
    formality: string;
    tone: string;
  };
}

interface Props {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

const TranslationHistory: React.FC<Props> = ({ history, onSelect }) => {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
      <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-4">
        سجل الترجمات
      </h2>
      <div className="space-y-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => onSelect(item)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-400">
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                {item.fromCache && (
                  <div className="flex items-center text-cyan-400">
                    <Database className="w-4 h-4 mr-1" />
                    <span className="text-xs">من التخزين المؤقت</span>
                  </div>
                )}
                {item.writingStyle && (
                  <div className="flex items-center text-indigo-400">
                    <Wand2 className="w-4 h-4 mr-1" />
                    <span className="text-xs">{item.writingStyle.formality} · {item.writingStyle.tone}</span>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {item.fromLang} → {item.toLang}
              </div>
            </div>
            <div className="text-sm">
              <div className="text-gray-300 mb-1">{item.originalText.substring(0, 100)}...</div>
              <div className="text-cyan-400">{item.translatedText.substring(0, 100)}...</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TranslationHistory;