import React from 'react';
import { Book } from 'lucide-react';

interface WordPair {
  source: string;
  target: string;
}

interface Props {
  pairs: WordPair[];
  sourceLang: string;
  targetLang: string;
  title?: string;
}

export default function WordPairs({ pairs, sourceLang, targetLang, title = "الكلمات ومقابلاتها" }: Props) {
  if (pairs.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <Book className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="text-sm font-medium text-gray-500 text-center pb-2 border-b">
          {sourceLang === 'ar' ? 'النص الأصلي' : 'Original Text'}
        </div>
        <div className="text-sm font-medium text-gray-500 text-center pb-2 border-b">
          {targetLang === 'ar' ? 'النص المترجم' : 'Translated Text'}
        </div>
        {pairs.map((pair, index) => (
          <React.Fragment key={index}>
            <div className={`p-2 bg-gray-50 rounded ${sourceLang === 'ar' ? 'text-right' : 'text-left'}`}>
              {pair.source}
            </div>
            <div className={`p-2 bg-gray-50 rounded ${targetLang === 'ar' ? 'text-right' : 'text-left'}`}>
              {pair.target}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}