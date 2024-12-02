import React, { useState, useRef, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface Props {
  text: string;
  dir: 'rtl' | 'ltr';
  onWordSelect?: (word: string) => void;
}

interface Selection {
  word: string;
  translation?: string;
}

export default function TextWithSelection({ text, dir, onWordSelect }: Props) {
  const [selections, setSelections] = useState<Selection[]>([]);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || !selection.toString().trim()) return;

    const word = selection.toString().trim();
    
    if (onWordSelect) {
      onWordSelect(word);
    }

    setSelections(prev => [...prev, { word }]);
    selection.removeAllRanges();
  };

  const removeSelection = (index: number) => {
    setSelections(prev => prev.filter((_, i) => i !== index));
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute top-2 right-2 z-20">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors"
          title={copied ? 'تم النسخ!' : 'نسخ النص'}
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>

      <div
        className={`whitespace-pre-wrap ${dir === 'rtl' ? 'text-right' : 'text-left'} pr-12`}
        onMouseUp={handleMouseUp}
      >
        {text}
      </div>
      
      {selections.map((selection, index) => (
        <div
          key={index}
          className="inline-block bg-indigo-100 rounded px-2 py-1 text-sm mr-2 mb-2"
        >
          <div className="flex items-center gap-2">
            <span>{selection.word}</span>
            {selection.translation && (
              <span className="text-gray-500">→ {selection.translation}</span>
            )}
            <button
              onClick={() => removeSelection(index)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}