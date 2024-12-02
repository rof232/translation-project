import React from 'react';
import { Clock } from 'lucide-react';

interface HistoryItem {
  id: number;
  from: string;
  to: string;
  originalText: string;
  translatedText: string;
  timestamp: Date;
}

interface Props {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

export default function TranslationHistory({ history, onSelect }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-4 max-h-[400px] overflow-y-auto">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-indigo-600" />
        <h2 className="text-lg font-semibold text-gray-800">سجل الترجمة</h2>
      </div>
      {history.length === 0 ? (
        <p className="text-gray-500 text-center"></p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelect(item)}
              className="p-3 rounded-md bg-gray-50 hover:bg-indigo-50 cursor-pointer transition-colors"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">
                  {item.from} → {item.to}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(item.timestamp).toLocaleTimeString('ar-SA')}
                </span>
              </div>
              <p className="text-sm text-gray-700 line-clamp-1">{item.originalText}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}