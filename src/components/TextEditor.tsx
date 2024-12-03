import React, { useState } from 'react';
import { Save, MessageCircle, Quote, Book, AlertCircle } from 'lucide-react';

interface TextEditorProps {
  originalText: string;
  onSave: (translatedText: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ originalText, onSave }) => {
  const [translatedText, setTranslatedText] = useState('');
  const [notes, setNotes] = useState<string[]>([]);
  const [showFormatting, setShowFormatting] = useState(false);

  const formatters = {
    dialogue: (text: string) => `"${text}"`,
    thought: (text: string) => '(${text})',
    action: (text: string) => `*${text}*`,
    emphasis: (text: string) => `_${text}_`,
    chapter_title: (text: string) => `# ${text}`,
    footnote: (text: string) => `[${text}]`
  };

  const addNote = (note: string) => {
    setNotes([...notes, note]);
  };

  const handleFormat = (formatter: keyof typeof formatters) => {
    const textarea = document.getElementById('translation-textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = translatedText.substring(start, end);
    const formattedText = formatters[formatter](selectedText);
    
    setTranslatedText(
      translatedText.substring(0, start) +
      formattedText +
      translatedText.substring(end)
    );
  };

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Original Text Panel */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-bold mb-2 flex items-center">
          <Book className="mr-2" />
          النص الأصلي
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg min-h-[400px]">
          {originalText}
        </div>
      </div>

      {/* Translation Panel */}
      <div className="border rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold flex items-center">
            <MessageCircle className="mr-2" />
            الترجمة
          </h3>
          <div className="flex gap-2">
            <button
              className="p-2 rounded hover:bg-gray-100"
              onClick={() => setShowFormatting(!showFormatting)}
            >
              <Quote />
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center"
              onClick={() => onSave(translatedText)}
            >
              <Save className="mr-2" />
              حفظ
            </button>
          </div>
        </div>

        {showFormatting && (
          <div className="flex gap-2 mb-2">
            {Object.keys(formatters).map((formatter) => (
              <button
                key={formatter}
                className="px-3 py-1 bg-gray-100 rounded-lg text-sm"
                onClick={() => handleFormat(formatter as keyof typeof formatters)}
              >
                {formatter}
              </button>
            ))}
          </div>
        )}

        <textarea
          id="translation-textarea"
          className="w-full h-[400px] p-4 rounded-lg border resize-none"
          value={translatedText}
          onChange={(e) => setTranslatedText(e.target.value)}
          dir="rtl"
        />

        {/* Notes Section */}
        <div className="mt-4">
          <h4 className="font-semibold flex items-center mb-2">
            <AlertCircle className="mr-2" />
            ملاحظات
          </h4>
          <div className="space-y-2">
            {notes.map((note, index) => (
              <div key={index} className="bg-yellow-50 p-2 rounded">
                {note}
              </div>
            ))}
            <button
              className="text-blue-500 text-sm"
              onClick={() => addNote('ملاحظة جديدة')}
            >
              + إضافة ملاحظة
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
