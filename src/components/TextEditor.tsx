import React, { useState, useEffect } from 'react';
import { Save, Copy, Trash, FileText } from 'lucide-react';

interface TextEditorProps {
  initialText?: string;
  onTextChange?: (text: string) => void;
  onSave?: (text: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}

const TextEditor: React.FC<TextEditorProps> = ({
  initialText = '',
  onTextChange,
  onSave,
  readOnly = false,
  placeholder = 'أدخل النص هنا...'
}) => {
  const [text, setText] = useState(initialText);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onTextChange?.(newText);
  };

  const handleSave = async () => {
    if (!onSave) return;
    setIsSaving(true);
    try {
      await onSave(text);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };

  const handleClear = () => {
    setText('');
    onTextChange?.('');
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileText className="text-cyan-400" size={20} />
          <span className="text-white font-medium">محرر النص</span>
        </div>
        <div className="flex gap-2">
          {!readOnly && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-cyan-400"
              >
                <Save size={16} />
                <span className="text-sm">حفظ</span>
              </button>
              <button
                onClick={handleClear}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-gray-400"
              >
                <Trash size={16} />
                <span className="text-sm">مسح</span>
              </button>
            </>
          )}
          <button
            onClick={handleCopy}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-gray-400"
          >
            <Copy size={16} />
            <span className="text-sm">نسخ</span>
          </button>
        </div>
      </div>

      {/* Editor */}
      <textarea
        value={text}
        onChange={handleTextChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className="w-full h-64 p-4 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-500 resize-none"
        style={{ direction: 'rtl' }}
      />

      {/* Word Count */}
      <div className="mt-2 text-sm text-gray-400 text-left">
        {text.trim().split(/\s+/).filter(Boolean).length} كلمة
      </div>
    </div>
  );
};

export default TextEditor;
